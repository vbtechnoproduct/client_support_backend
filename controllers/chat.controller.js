const Chat = require("../models/chat.model");

//import model
const ChatTopic = require("../models/chatTopic.model");
const Developer = require("../models/developer.model");
const Client = require("../models/client.model");

//deletefile
const { deleteFile } = require("../util/deleteFile");

//fcm-node
var fcmNode = require("fcm-node");
var fcm = new fcmNode(process?.env?.SERVER_KEY);

//create chat with image for developer or client
exports.createChat = async (req, res) => {
  try {
    const { senderId, receiverId, senderRole, receiverRole, messageType } = req.body;
    const file = req.file;

    if (!senderId || !receiverId || !file || !senderRole || !receiverRole || !messageType) {
      if (req.file) deleteFile(req.file);
      return res.status(400).json({ status: false, message: "Oops ! Invalid details." });
    }

    let senderPromise, receiverPromise;

    if (senderRole === "developer") {
      senderPromise = Developer.findById(senderId);
    } else if (senderRole === "client") {
      senderPromise = Client.findById(senderId);
    } else if (senderRole === "admin") {
      senderPromise = Admin.findById(senderId);
    } else {
      return res.status(200).json({ status: false, message: "senderRole must be passed valid." });
    }

    if (receiverRole === "developer") {
      receiverPromise = Developer.findById(receiverId);
    } else if (receiverRole === "client") {
      receiverPromise = Client.findById(receiverId);
    } else if (senderRole === "admin") {
      senderPromise = Admin.findById(senderId);
    } else {
      return res.status(200).json({ status: false, message: "receiverRole must be passed valid." });
    }

    const [sender, receiver] = await Promise.all([senderPromise, receiverPromise]);

    if (!sender) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "sender not found or invalid role." });
    }

    if (!receiver) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "receiver not found or invalid role." });
    }

    const foundChatTopic = await ChatTopic.findOne({
      $or: [{ $and: [{ sender: sender._id }, { receiver: receiver._id }] }, { $and: [{ sender: receiver._id }, { receiver: sender._id }] }],
    }).populate("sender receiver");

    const chat = new Chat();

    chat.sender = sender._id;
    chat.role = senderRole;

    if (messageType == 2) {
      chat.messageType = 2;
      chat.message = "📸 Image";
      chat.image = req.file ? process?.env?.baseURL + req?.file?.path : null;
    } else if (messageType == 3) {
      chat.messageType = 3;
      chat.message = "📦 Zip";
      chat.image = req.file ? process?.env?.baseURL + req?.file?.path : null;
    } else {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "messageType must be passed valid." });
    }

    chat.chatTopic = foundChatTopic._id;
    chat.date = new Date().toLocaleString();

    foundChatTopic.chat = chat._id;

    await Promise.all([chat.save(), foundChatTopic.save()]);

    console.log("chat:    ", global.globalRoom);

    io.in(globalRoom).emit("message", chat);

    res.status(200).json({
      status: true,
      message: "Success",
      data: chat,
    });

    let IdSender,
      IdReceivers = [];

    if (foundChatTopic.sender._id.toString() === req.body.senderId.toString()) {
      console.log("come first");

      IdSender = foundChatTopic.sender;
      IdReceiver = foundChatTopic.receiver;
    } else if (foundChatTopic.receiver._id.toString() === req.body.senderId.toString()) {
      console.log("come second");

      IdSender = foundChatTopic.receiver;
      IdReceiver = foundChatTopic.sender;
    } else if (foundChatTopic.admin._id.toString() === data?.chatData?.sender?.toString()) {
      console.log("come third");

      IdSender = foundChatTopic.admin;

      const client = await Client.findById(foundChatTopic?.receiver?._id);
      const developer = await Developer.findById(foundChatTopic?.sender?._id);

      if (data.chatData.mention.includes(client._id.toString()) && data.chatData.mention.includes(developer._id.toString())) {
        console.log("Developer and Client mentioned");
        IdReceivers.push(foundChatTopic.receiver, foundChatTopic.sender);
      } else if (data.chatData.mention.includes(client._id.toString())) {
        console.log("Client mentioned");
        IdReceivers.push(foundChatTopic.receiver);
      } else if (data.chatData.mention.includes(developer._id.toString())) {
        console.log("Developer mentioned");
        IdReceivers.push(foundChatTopic.sender);
      } else if (data.chatData.mention.length === 0) {
        console.log("if NoOne any mention Developer and Client mentioned");
        IdReceivers.push(foundChatTopic.receiver, foundChatTopic.sender);
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
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//create chat with image for admin
exports.createChatByAdmin = async (req, res) => {
  try {
    if (!req.body.chatTopic || !req.body.senderId || !req.body.messageType) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "chatTopic,messageType and senderId must be requried." });
    }

    const chatTopic = await ChatTopic.findOne({ _id: req.body.chatTopic });
    if (!chatTopic) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "chatTopic does not found." });
    }

    const chat = new Chat();

    chat.sender = req.body.senderId;
    chat.role = "admin";

    if (req.body.messageType == 2) {
      chat.messageType = 2;
      chat.message = "📸 Image";
      chat.image = req.file ? process?.env?.baseURL + req?.file?.path : null;
    } else if (req.body.messageType == 3) {
      chat.messageType = 3;
      chat.message = "📦 Zip";
      chat.image = req.file ? process?.env?.baseURL + req?.file?.path : null;
    } else {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "messageType must be passed valid." });
    }

    chat.chatTopic = chatTopic._id;
    chat.date = new Date().toLocaleString();

    chatTopic.chat = chat._id;

    await Promise.all([chat.save(), chatTopic.save()]);

    io.in(globalRoom).emit("message", chat);

    return res.status(200).json({
      status: true,
      message: "Success",
      data: chat,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get old chat for developer and client
exports.getOldChat = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    if (!req.query.chatTopic || !req.query.receiver) {
      return res.status(200).json({ status: false, message: "chatTopic and receiver must be requried." });
    }

    const chatTopic = await ChatTopic.findOne({ _id: req.query.chatTopic });
    if (!chatTopic) {
      return res.status(200).json({ status: false, message: "chatTopic does not found." });
    }

    const [total, chat] = await Promise.all([
      Chat.countDocuments({
        chatTopic: chatTopic._id,
        $or: [{ mentionedHandle: { $in: [req.query.receiver] } }, { mentionedHandle: [] }],
      }),
      Chat.find({
        chatTopic: chatTopic._id,
        $or: [{ mentionedHandle: { $in: [req.query.receiver] } }, { mentionedHandle: [] }],
      })
        .populate("replyMessageId")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({ status: true, message: "finally, get old chat by the admin.", total: total, data: chat });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get old chat for admin
exports.getOldChatAdmin = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    if (!req.query.chatTopic) {
      return res.status(200).json({ status: false, message: "chatTopic must be requried." });
    }

    const chatTopic = await ChatTopic.findOne({ _id: req.query.chatTopic });
    if (!chatTopic) {
      return res.status(200).json({ status: false, message: "chatTopic does not found." });
    }

    const [total, chat] = await Promise.all([
      Chat.countDocuments({ chatTopic: chatTopic._id }),
      Chat.find({ chatTopic: chatTopic._id })
        .populate("replyMessageId")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({ status: true, message: "finally, get old chat by the admin.", total: total, data: chat });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get thumb list for admin
exports.getChatList = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [total, chatThumbList] = await Promise.all([
      ChatTopic.countDocuments(),
      ChatTopic.find()
        .populate("receiver", "name image colorCode isOnline")
        .populate("sender", "name image isOnline")
        .populate("chat", "messageType message date")
        .populate("ticket", "ticketId issueDescription appName status")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({ status: true, message: "Success", data: chatThumbList, total: total });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.errorMessage || "Internal Server Error" });
  }
};

//when @ type at that time room member get
exports.getRoomMember = async (req, res) => {
  try {
    if (!req.query.chatTopic) {
      return res.status(200).json({ status: false, message: "chatTopic must be requried." });
    }

    const chatTopic = await ChatTopic.findOne({ _id: req.query.chatTopic })
      .select("sender receiver")
      .populate("sender", "name")
      .populate("receiver", "name");

    if (!chatTopic) {
      return res.status(200).json({ status: false, message: "chatTopic does not found." });
    }

    const data = {
      sender: chatTopic.sender.name,
      receiver: chatTopic.receiver.name,
    };

    return res.status(200).json({ status: true, message: "Success", data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.errorMessage || "Internal Server Error" });
  }
};

//get thumb list for developer
exports.getChatListForDeveloper = async (req, res) => {
  try {
    const developer = await Developer.findById(req.query.developerId);
    if (!developer) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "developer does not found." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let chatThumblist = await ChatTopic.find({ sender: developer._id })
      .populate("receiver", "name image colorCode isOnline")
      .populate("sender", "name image isOnline")
      .populate("admin")
      .populate("chat", "messageType message date")
      .populate("ticket", "ticketId issueDescription appName status")
      .sort({ createdAt: -1 })
      .skip((start - 1) * limit)
      .limit(limit);

    //Filter chatThumblist to include only tickets with status "Open" and "ReOpen"
    chatThumblist = chatThumblist.filter((item) => item.ticket && (item.ticket.status === 1 || item.ticket.status === 3));

    return res.status(200).json({ status: true, message: "Success", data: chatThumblist });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.errorMessage || "Internal Server Error" });
  }
};
