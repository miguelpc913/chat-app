const socket = io();
const selectors = {
    sendMessageButton : document.querySelector("#submit-chat-text"),
    messageInput : document.querySelector("#chat-text"),
    shareLocationButton : document.querySelector("#share-location"),
    messages : document.querySelector("#message-container"),
    sidebar : document.querySelector("#sidebar")
}
const templates = {
    messageTemplate : document.querySelector("#message-template").innerHTML,
    locationTemplate : document.querySelector("#location-template").innerHTML,
    sidebarTemplate : document.querySelector("#sidebar-template").innerHTML
}

const autoScroll = () =>{
    const $newMessage = selectors.messages.lastElementChild;
    const newMessageMargin = parseInt(getComputedStyle($newMessage).marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = selectors.messages.offsetHeight
    const containerHeight = selectors.messages.scrollHeight
    const offSetTop = selectors.messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= offSetTop){
        selectors.messages.scrollTop = containerHeight;
    }
}

const {username , room} = Qs.parse(window.location.search , {
    ignoreQueryPrefix: true
})
socket.on("sendMessage" , (message) =>{
    const html = Mustache.render(templates.messageTemplate , {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm A')
    })
    selectors.messages.insertAdjacentHTML('beforeend' , html)
    autoScroll()
})

socket.on("sendLocation" , (location) =>{
    const html = Mustache.render(templates.locationTemplate , {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('hh:mm A')
    })
    selectors.messages.insertAdjacentHTML('beforeend' , html)
    autoScroll()
})

socket.on("roomData" , ({room , users})=>{
    const html = Mustache.render(templates.sidebarTemplate , {
        room,
        users
    })
    selectors.sidebar.innerHTML = html;
})

selectors.sendMessageButton.addEventListener("click" , (e) =>{
    e.preventDefault()
    const message = selectors.messageInput.value;
    if(message !== ""){
        selectors.sendMessageButton.setAttribute("disabled" , "true")
        selectors.messageInput.value = "";
        selectors.messageInput.focus()
        socket.emit("clientSendMessage" , message , error =>{
            if(error){
                return console.log(error);
            }
            selectors.sendMessageButton.removeAttribute("disabled")
        })
    }
})

selectors.shareLocationButton.addEventListener("click", (e)=>{
    e.preventDefault();
    if(!navigator.geolocation){
        alert("Browser does not support geolocation");
    }
    selectors.shareLocationButton.setAttribute("disabled" , "true")
    navigator.geolocation.getCurrentPosition( position =>{
        socket.emit("sendLocation" , {latitude: position.coords.latitude , longitude: position.coords.longitude} , report =>{
            console.log(report)
            selectors.shareLocationButton.removeAttribute("disabled")
        })
    })
})
socket.emit("join" , {username , room} , (error)=>{
    if(error){
        alert(error)
        window.location = "/"
    }
})