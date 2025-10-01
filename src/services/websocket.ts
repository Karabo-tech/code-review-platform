
import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import http from 'http';
import net from 'net';

declare module 'ws' {
  interface WebSocket {
    user?: {
      id: number;
    };
  }
}

const wss = new WebSocketServer({ noServer: true });

export function setupWebSocket(server: any) {
// Define a custom interface for the user payload extracted from the JWT.
interface CustomUser {
    id: number;
}

server.on('upgrade', (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const authHeader: string | string[] | undefined = req.headers['authorization'];
    const token: string | undefined =
        authHeader && typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;
    if (!token) {
        socket.end('Unauthorized');
        return;
    }
    jwt.verify(token, process.env.JWT_SECRET!, (err: jwt.VerifyErrors | null, decoded?: string | jwt.JwtPayload) => {
        if (err) {
            socket.destroy();
            return;
        }
        wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
            (ws as WebSocket & { user?: CustomUser }).user = decoded as CustomUser;
            wss.emit('connection', ws, req);
        });
    });
});

  wss.on('connection', (ws: any) => {
    ws.on('message', (message: string) => {
      console.log(`Received: ${message}`);
    });
  });
}

export function broadcastNotification(userId: number, type: string, message: string) {
  wss.clients.forEach((client: any) => {
    if (client.user.id === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, message }));
    }
  });
}