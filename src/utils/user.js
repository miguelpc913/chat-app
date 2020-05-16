const users = [];

const addUser = ({id , username , room}) =>{
    //Cleaning Data
    username = username.toLowerCase().trim();
    room = room.toLowerCase().trim();

    if(!username || !room){
        return{
            error: "Username and room are required"
        }
    }

    const existingUsername = users.find(user =>{
        return user.room === room && user.username === username
    })

    if(existingUsername){
        return{
            error: "Username is taken"
        }
    }

    const user = {id , username ,  room}
    users.push(user);
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex( user => user.id === id )
    if(index !== -1){
        return users.splice(index , 1)[0]
    }
};

const getUser = (id)=>{
    const user = users.find(user => user.id === id )
    if(user){
        return user;
    }
}

const getUsersInRoom = (room)=>{
    room = room.toLowerCase().trim() 
    const usersInRoom = users.filter(user => user.room === room)
    if(usersInRoom.length > 0){
        return usersInRoom
    }else{
        return {
            error: "Room Empty"
        }
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}