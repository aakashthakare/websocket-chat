import { connection } from "websocket";
import { OutgoingMessage } from "../messages/OutgoingMessages";

interface User {
    name: string;
    id: string;
    connection: connection;
}

interface Room {
    users: User[]
}

export class UserManager {
    private rooms: Map<string, Room>;
    
    constructor() {
        this.rooms = new Map<string, Room>()
    }

    
    addUser(name: string, userId: string, roomId: string, ws: connection){
        if(!this.rooms.get(roomId)) {
            this.rooms.set(roomId, {
                users: []
            })
        }
        this.rooms.get(roomId)?.users.push({
            id: userId,
            name,
            connection: ws
        });
        ws.on('close', (reasonCode, description) => {
            this.removeUser(userId, roomId);
        })
    }

    removeUser(userId: string, roomId: string){
        console.log("User Removed");
        const users = this.rooms.get(roomId)?.users;
        if(users) {
            users.filter(({id}) => id != userId);
        }
    }

    getUser(userId: string, roomId: string){
        const user = this.rooms.get(roomId)?.users.find(({id}) => id == userId);
        return user ?? null;
    }

    broadcast(roomId: string, userId: string, message: OutgoingMessage) {
        const user = this.getUser(userId, roomId);
        if(!user) {
            console.log("User not found in database");
        }

        const room = this.rooms.get(roomId);
        if(!room) {
            console.log("User not found in database");
        }

       room?.users.forEach(({connection, id}) => {
            console.log("Outgoing message : " + JSON.stringify(message));
            connection.sendUTF(JSON.stringify(message));
       })
    }
}