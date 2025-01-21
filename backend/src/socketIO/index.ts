import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import Docker from 'dockerode'
import fs from 'fs'
import path from 'path';
import chokidar from 'chokidar'


type Node = {
    name: string;
    nodes?: Node[];
};

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
});

export const getReceiverSocket = (receiverId: any) => {
    return users[receiverId];
}

const docker = new Docker();
let containerCount = 0;
const clientContainers: { [key: string]: Docker.Container } = {};

const users: { [key: string]: any } = {}
const activeUsers: { [key: string]: NodeJS.Timeout } = {}

const frameworkToImageMap: { [key: string]: string } = { 'node': 'node:latest', 'cpp': 'cpp-app:latest', 'react.js': 'my-app-app:latest' }
const userToFrameworkMap: { [key: string]: string } = {}

const sendFiles = async (pathToRead: string): Promise<Node[]> => {
    try {
        const dir = await fs.promises.readdir(pathToRead);
        const nodes: Node[] = [];
        for (const file of dir) {
            const fullPath = path.join(pathToRead, file);
            const stat = await fs.promises.stat(fullPath);
            if (stat.isDirectory()) {
                nodes.push({
                    name: file,
                    nodes: await sendFiles(fullPath),
                });
            } else {
                nodes.push({ name: file });
            }
        }
        return nodes;
    } catch (error) {
        console.error('Error reading files:', error);
        return [];
    }
};

io.on("connection", (socket) => {
    console.log('New connection: ', socket.id)

    const userId = socket.handshake.query.userId as string;

    if (userId) {
        users[userId] = socket;
    }

    const workspacePath = `/home/rudra/Desktop/Container/${userId}`
    const watcher = chokidar.watch(workspacePath, { persistent: true })

    const sendUpatedFiles = async () => {
        const fileTree = await sendFiles(workspacePath);
        socket.emit('files:rw', fileTree);
    }

    sendUpatedFiles();

    socket.on('files:rw', () => {
        sendUpatedFiles();
    });

    const debounce = (func: any, delay: number) => {
        let timer: NodeJS.Timeout;
        return (...args: any) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const sendUpdatedFilesDebounced = debounce(sendUpatedFiles, 200);
    watcher.on('all', sendUpdatedFilesDebounced);


    socket.on('newcontainer', async ({ framework }) => {
        try {
            const image = framework === "" || framework === "undefined" ? `ubuntu:latest` : frameworkToImageMap[framework];
            userToFrameworkMap[userId] = frameworkToImageMap[framework];
            console.log('Image: ', image);
            const images = await docker.listImages();
            const ubuntuImage = images.find(
                (img) => img.RepoTags && img.RepoTags.includes(image)
            )

            if (!ubuntuImage) {
                console.log('Pulling ubuntu image')
                await new Promise((resolve, reject) => {
                    docker.pull(image, (err: any, stream: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        docker.modem.followProgress(stream, resolve, reject);
                    });
                })
            }

            const container = await docker.createContainer({
                Image: image,
                name: `${socket.id}-${++containerCount}`,
                Tty: true,
                Cmd: ['/bin/bash'],
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Binds: ['/home/rudra/Desktop/Container:/workspace'],
                    NetworkMode: 'bridge',
                    PortBindings: {
                        "3000/tcp": [{ "HostPort": "8080" }],
                    }
                },
                WorkingDir: `/workspace/${userId}`,
            })

            await container.start();

            const exec = await container.exec({
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: ['bash'],
            })

            exec.start({ hijack: true, stdin: true }, (err: any, stream: any) => {
                if (err) {
                    console.error('Error starting exec: ', err);
                    return;
                }

                stream.on('data', (data: any) => {
                    const streamType = data.readUInt8(0);
                    const payload = data.slice(8);

                    if (streamType === 1) {
                        socket.emit('terminal:data', payload.toString());
                    } else if (streamType === 2) {
                        console.error('Error: ', payload.toString());
                    }
                })

                socket.on('terminal:write', (data) => {
                    stream.write(data);
                })

                clientContainers[userId] = container;
            })
        } catch (error) {
            console.error(error)
        }
    })

    socket.on('file:read', async ({ fileName }) => {
        try {
            const filePath = path.join(workspacePath, fileName);

            if (!fs.existsSync(filePath)) {
                console.log('File does not exist: ', filePath);
                return;
            }

            const content = await fs.promises.readFile(filePath, 'utf-8');

            socket.emit('file:content', content);
        } catch (error) {
            console.error('Error reading file: ', error);
        }

    })

    socket.on('files:write', async ({ filename, content }) => {
        try {
            if (filename === undefined || content === undefined) {
                console.error('Filename or content is undefined');
                return;
            }

            const filePath = path.join(workspacePath, filename);

            if (!fs.existsSync(filePath)) {
                console.log('File does not exist: ', filePath);
                return;
            }

            await fs.promises.writeFile(filePath, content, 'utf-8');

        } catch (error) {
            console.error('Error writing file: ', error);
        }
    })

    // socket.on('disconnect', async () => {
    //     console.log('Disconnecting container: ', socket.id)
    //     activeUsers[userId] = setTimeout(async () => {
    //         try {
    //             if (clientContainers[userId]) {
    //                 await clientContainers[userId].stop();
    //                 await clientContainers[userId].remove();
    //                 delete clientContainers[userId];
    //             }
    //         } catch (error) {
    //             console.error('Error stopping container: ', error);
    //         }
    //     }, 30000);
    // })
    // 
    socket.on('reconnect', async () => {
        console.log('Reconnecting container: ', socket.id)
        if (activeUsers[userId]) {
            clearTimeout(activeUsers[userId]);
            delete activeUsers[userId];
        }

        if (!clientContainers[userId]) {
            console.log(`Creating new container for user: ${userId}`);
            const img = userToFrameworkMap[userId] === "undefined" ? "ubuntu:latest" : userToFrameworkMap[userId];
            const container = await docker.createContainer({
                Image: img,
                name: `${socket.id}-${++containerCount}`,
                Tty: true,
                Cmd: ['/bin/bash'],
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Binds: ['/home/rudra/Desktop/Container:/workspace'],
                    NetworkMode: 'bridge',
                },
                WorkingDir: `/workspace/${userId}`,
            });

            await container.start();
            clientContainers[userId] = container;
        }


        const container = clientContainers[userId];

        if (container) {
            const exec = await container.exec({
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: ['bash'],
            })

            exec.start({ hijack: true, stdin: true }, (err: any, stream: any) => {
                if (err) {
                    console.error('Error starting exec:', err);
                    return;
                }

                stream.on('data', (data: any) => {
                    const streamType = data.readUInt8(0);
                    const payload = data.slice(8);

                    if (streamType === 1) {
                        socket.emit('terminal:data', payload.toString());
                    } else if (streamType === 2) {
                        console.error('Error:', payload.toString());
                    }
                });

                socket.on('terminal:write', (data) => {
                    stream.write(data);
                });
            });
        }
    });

    socket.on('run', ({ filename }) => {
        const container = clientContainers[userId];
        const framework = userToFrameworkMap[userId];
    
        if (framework === 'cpp-app:latest') {
            const command = `rm -rf output && g++ ${filename} -o output && ./output`;
    
            container.exec({
                Cmd: ['bash', '-c', `cd /workspace/${userId} && ${command}`],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
            }, (err, exec) => {
                if (err) {
                    console.error('Error creating exec:', err);
                    return;
                }
    
                exec?.start({ hijack: true, stdin: true }, (err, stream) => {
                    if (err) {
                        console.error('Error starting exec:', err);
                        return;
                    }
    
                    stream?.on('data', (data: any) => {
                        const streamType = data.readUInt8(0);
                        const payload = data.slice(8);
    
                        if (streamType === 1) {
                            socket.emit('terminal:data', payload.toString());
                        } else if (streamType === 2) {
                            console.error('Error:', payload.toString());
                        }
                    });

                    stream?.on('end', () => {
                        socket.emit('terminal:data', '\n');
                    });

                    socket.on('terminal:write', (data) => {
                        if(!data.endsWith('\n')) {
                            data += '\n';
                        }

                        stream?.write(data);

                        setTimeout(() => {
                            stream?.write('\n');
                        },10);
                    });
                });
            });
        }
    });
    

    socket.on('files:rename', ({ oldName, newName }) => {
        const oldPath = path.join(workspacePath, oldName);

        const getFolderPath = (filePath: any) => {
            const lastSlashIndex = filePath.lastIndexOf('/');
            return lastSlashIndex !== -1 ? filePath.slice(0, lastSlashIndex) : '';
        };
        const pathOfOldFile = getFolderPath(oldName);
        const newPathBase = path.join(workspacePath, pathOfOldFile);
        const newPath = path.join(newPathBase, newName);

        if (fs.existsSync(oldPath)) {
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error('Error renaming file or directory: ', err);
                    return;
                }
                console.log(`Renamed ${oldPath} to ${newPath}`);
                sendUpatedFiles();
            });
        } else {
            console.error(`Path does not exist: ${oldPath}`);
        }
    })
});

export { app, io, server };

