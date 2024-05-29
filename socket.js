///import model
const ChatTopic = require("./models/chatTopic.model");
const Chat = require("./models/chat.model");
const Ticket = require("./models/ticket.model");
const Client = require("./models/client.model");
const Developer = require("./models/developer.model");

//fcm-node
var fcmNode = require("fcm-node");
var fcm = new fcmNode(process?.env?.SERVER_KEY);

io.on("connection", async (socket) => {
  console.log("Socket Connection done Client ID: ", socket.id);
  console.log("socket.connected:           ", socket.connected);
  console.log("Current rooms:", socket.rooms);
  console.log("socket.handshake.query", socket.handshake.query);

  global.globalRoom = socket.handshake.query.globalRoom;
  console.log("globalRoom in socket.js:  ", globalRoom);

  const uniqueId = socket.handshake.query.uniqueId;
  console.log("uniqueId in socket.js:  ", uniqueId);

  socket.join(globalRoom);

  socket.on("ticket", async (data) => {
    console.log("data in ticket =====================================  ", data);

    try {
      const ticket = await Ticket.findOne({ ticketId: data })
        .populate("client", "name isOnline colorCode")
        .populate("developer", "name image isOnline");

      console.log("ticket:  ", ticket);

      const chatTopic = await ChatTopic.findOne({ ticket: ticket._id }).populate("admin");
      console.log("chatTopic:  ", chatTopic);

      const [sockets, developer, client] = await Promise.all([
        io.in(globalRoom).fetchSockets(),
        Developer.findOneAndUpdate({ _id: chatTopic.sender }, { $set: { isOnline: true } }, { new: true }),
        Client.findOneAndUpdate({ _id: chatTopic.receiver }, { $set: { isOnline: true } }, { new: true }),
      ]);

      console.log("sockets in ticket:", sockets.length);
      console.log("developer isOnline:  ", developer.isOnline);
      console.log("client isOnline:  ", client.isOnline);

      io.in(globalRoom).emit("ticket", { ticket: ticket, chatTopic: chatTopic });
    } catch (error) {
      console.error("Error processing ticket:", error);
    }
  });

  socket.on("message", async (data) => {
    console.log("data in message =====================================  ", data);

    const chatTopic = await ChatTopic.findById(data?.chatData?.chatTopicId).populate("sender receiver admin");
    console.log("chatTopic in message:  ", chatTopic._id);

    const socket1 = await io.in(globalRoom).fetchSockets();
    console.log("socket1 in message:", socket1.length);

    if (chatTopic) {
      const chat = new Chat();

      chat.sender = data?.chatData?.sender;
      chat.role = data?.chatData?.senderRole;
      chat.messageType = 1;
      chat.message = data?.chatData?.message;
      chat.mentionedHandle = data?.chatData?.mention;
      chat.image = null;
      chat.isReply = data.chatData.isReply;
      chat.replyMessageId = data.chatData.replyMessageId;
      chat.chatTopic = chatTopic._id;
      chat.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      await chat.save();

      const dataOfChatPromise = Chat.findById(chat._id).populate("replyMessageId");
      const chatTopicUpdatePromise = ChatTopic.findByIdAndUpdate(chatTopic._id, { chat: chat._id });

      const [dataOfChat] = await Promise.all([dataOfChatPromise, chatTopicUpdatePromise]);

      io.in(globalRoom).emit("message", { chat: dataOfChat });

      let IdSender,
        IdReceivers = [];
      if (chatTopic.sender._id.toString() === data?.chatData?.sender?.toString()) {
        console.log("come first");

        IdSender = chatTopic.sender;
        IdReceivers.push(chatTopic.receiver);
      } else if (chatTopic.receiver._id.toString() === data?.chatData?.sender?.toString()) {
        console.log("come second");

        IdSender = chatTopic.receiver;
        IdReceivers.push(chatTopic.sender);
      } else if (chatTopic.admin._id.toString() === data?.chatData?.sender?.toString()) {
        console.log("come third");

        IdSender = chatTopic.admin;

        const client = await Client.findById(chatTopic?.receiver?._id);
        const developer = await Developer.findById(chatTopic?.sender?._id);

        if (data.chatData.mention.includes(client._id.toString()) && data.chatData.mention.includes(developer._id.toString())) {
          console.log("Developer and Client mentioned");
          IdReceivers.push(chatTopic.receiver, chatTopic.sender);
        } else if (data.chatData.mention.includes(client._id.toString())) {
          console.log("Client mentioned");
          IdReceivers.push(chatTopic.receiver);
        } else if (data.chatData.mention.includes(developer._id.toString())) {
          console.log("Developer mentioned");
          IdReceivers.push(chatTopic.sender);
        } else if (data.chatData.mention.length === 0) {
          console.log("if NoOne any mention Developer and Client mentioned");
          IdReceivers.push(chatTopic.receiver, chatTopic.sender);
        }
      }

      if (IdReceivers.length > 0) {
        console.log("receivers in chat with message:  ", IdReceivers);

        const payload = {
          registration_ids: IdReceivers.map((receiver) => receiver.fcmToken),
          notification: {
            title: `${IdSender.name}`,
            body: `${chat.message}`,
            image: IdSender.image !== null ? IdSender.image : null,
            colorCode: IdSender?.colorCode,
          },
        };

        await fcm.send(payload, function (err, response) {
          if (err) {
            console.log("Something has gone wrong: ", err);
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });
      }
    }
  });

  //socket disconnect
  socket.on("disconnect", async (reason) => {
    console.log(`socket disconnect ===============`, socket?.id, reason, globalRoom, uniqueId);

    if (uniqueId) {
      console.log("come in uniqueId");

      const client = await Client.findOne({ uniqueId: uniqueId });
      console.log("client  ", client);

      if (client) {
        await Client.findOneAndUpdate({ _id: client._id, isOnline: true }, { $set: { isOnline: false } }, { new: true });
      } else {
        const developer = await Developer.findOne({ uniqueId: uniqueId });
        console.log("developer  ", developer);

        await Developer.findOneAndUpdate({ _id: developer._id, isOnline: true }, { $set: { isOnline: false } }, { new: true });
      }
    }

    if (globalRoom) {
      const socket = await io.in(globalRoom).fetchSockets();
      if (socket?.length == 0) {
        console.log("socket length is zero");
      }
    }
  });
});
