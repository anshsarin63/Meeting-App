const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peers = {};
const peer = new Peer(undefined, {
  // path: "/peerjs",
  // host: "/",
  // port: "3001",
});

let myVideoStream;
// var getUserMedia=navigator.getUserMedia;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call",(call) => {
      console.log("call lgyi");
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      // console.log("userconnected");
      connectToNewUser(userId, stream);
    });
  });
  

document.addEventListener("keydown", (e) => {
  // console.log(e);
  if (e.keyCode === 13 && chatInputBox.value != "") {
    socket.emit("message", chatInputBox.value);
    chatInputBox.value = "";
  }
});
function buttonAction(){
  socket.emit("message", chatInputBox.value);
    chatInputBox.value = "";
}

socket.on("createMessage", (msg) => {
  console.log(msg);
  let li = document.createElement("li");
  li.innerHTML = msg;
  all_messages.append(li);
  main__chat__window.scrollTop = main__chat__window.scrollHeight;
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
    console.log("band ho gya");
  }
  // if (peers[userId]) peers[userId].close();
});

// peer.on("call",(call)=>{
//   getUserMedia(
//     {video:true,audio:true},
//     function (stream){
//       call.answer(stream);
//       const video=document.createElement("video");
//       call.on("stream",(remoteStream)=>{
//         addVideoStream(video,remoteStream);
//       });
//     },
//     function(err){
//       console.log("connection failed",err);
//     }
//   );
// });

peer.on("open", (id) => {
  // console.log("peer on");
  socket.emit("join-room", ROOM_ID, id);
});

const addVideoStream = (videoE1, stream) => {
  videoE1.srcObject = stream;
  videoE1.addEventListener("loadedmetadata", () => {
    videoE1.play();
  });
  videoGrid.append(videoE1);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (var idx = 0; idx < totalUsers; idx++) {
      document.getElementsByTagName("video")[idx].style.width =
        100 / totalUsers + "%";
    }
  }
};

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  console.log(call);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log("new user");
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    console.log("closed");
    video.remove();
  });
  // console.log(userId);
  peers[userId] = call;
}

function showChat(e) {
  var x = document.getElementById("main__right");
  var y = document.getElementById("main__left");
  if (x.style.display === "none") {
    x.style.display = "flex";
    y.style.flex = "0.8";
  } else {
    x.style.display = "none";
    y.style.flex = "1";
  }
}
function showInvitePopup() {
  //   document.body.classList.add("showInvite");
  document.getElementById("overlay").style.display = "block";
  document.getElementById("roomLink").value = window.location.href;
}
function hideInvitePopup() {
  //   document.body.classList.remove("showInvite");
  document.getElementById("overlay").style.display = "none";
}
function copyToClipboard() {
  var copyText = document.getElementById("roomLink");
  copyText.select();
  copyText.setSelectionRange(0, 9999);
  document.execCommand("copy");
  alert("copied : " + copyText.value);
}

function playStop() {
  var enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    setPlayVideo();
    myVideoStream.getVideoTracks()[0].enabled = false;
    // myVideoStream.getVideoTracks()[0].stop();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
    // myVideoStream.getVideoTracks()[0].enabled();
  }
}
function setPlayVideo() {
  const html = `<i class="unmute fas fa-video-slash"></i>
  <span class="unmute">Resume Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
}
function setStopVideo() {
  const html = `<i class="fa fa-video-camera"></i>
  <span>Pause Video</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
}

function muteUnmute() {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
}
const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
