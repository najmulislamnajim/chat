window.addEventListener('beforeunload', function () {
    localStorage.clear();
});

const saveUserInfo = function() {
    const user = document.getElementById('userName').value;
    const group = document.getElementById('userGroup').value;
    localStorage.setItem('userName', user);
    localStorage.setItem('userGroup', group);
    renderChatInterface();
}

const renderChatInterface = function() {
    const userName = localStorage.getItem('userName');
    const userGroup = localStorage.getItem('userGroup');

    if (userName && userGroup) {
        const parent = document.getElementById('chat');
        parent.innerHTML = `
            <h3>Welcome, ${userName} in ${userGroup}!</h3>
            <div id="wsMessage" style="margin:10px; padding:20px;margin-left:110px;padding-top:0px;width:700px">
            <h4 style="margin:auto;text-align:center;">Message Box</h4>
                
            </div>
            <div style="margin-left:100px">
                <input type="text" id="chat-message" size="100" placeholder="Enter your message" style="padding:10px;margin:10px">
                <br>
                <input type="button" value="Send" id="chat-submit" style="padding:10px;margin:10px">
            </div>
        `;
        const ws=new WebSocket(`ws://127.0.0.1:8000/ws/ac-chat/${userGroup}/`)
        ws.onopen = function(){
            console.log('websocket connected...');
        }

        ws.onmessage = function(event){
            const data=JSON.parse(event.data);
            let myUser=data.userName;
            let msg=data.msg;
            const messageElement = document.createElement('p');
            messageElement.className ='message';
            if (myUser===userName){
                messageElement.innerHTML=`
                    <span style="color:green">${myUser}</span>: ${msg}
                `
            }else{
                messageElement.innerHTML=`
                    <span style="color:red">${myUser}</span>: ${msg}
                `
            }
            
            const messageDiv = document.getElementById('wsMessage');
            messageDiv.appendChild(messageElement);
        }

        ws.onerror = function(event){
            console.log('websocket error',event)
        }

        ws.onclose = function(event){
            console.log('websocket close',event)
        }

        document.getElementById('chat-submit').onclick = function(){
            const message = document.getElementById('chat-message').value;
            ws.send(JSON.stringify({
                'userName':userName,
                'msg':message
            }));
            document.getElementById('chat-message').value = '';
            document.getElementById('chat-message').focus();
            
        }
        document.getElementById('chat-message').addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                document.getElementById('chat-submit').click();
            }
        });
        document.getElementById('userinfo').innerHTML = ''; 
    } else {
        const parent = document.getElementById('userinfo');
        parent.innerHTML = `
            <input type="text" id="userName" size="100" placeholder="Enter your name" style="padding:10px;margin:10px">
            <input type="text" id="userGroup" size="100" placeholder="Enter your group" style="padding:10px;margin:10px">
            <br>
            <input type="button" value="Submit" id="user_submit" onclick="saveUserInfo()" style="padding:10px;margin:10px">
        `;
        document.getElementById('chat').innerHTML = '';
    }
}

window.onload = renderChatInterface;
