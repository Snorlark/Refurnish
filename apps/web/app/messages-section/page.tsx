"use client";
import React, { useState } from "react";
import {
    MessageSquare,
    Send,
    MoreHorizontal,
    Phone,
    Video,
} from "lucide-react";
import UserProfileSidebar from "../../components/UserProfileSidebar";
import Footer from "../../components/Footer";
import NavbarMenu from "../../components/Navbar-Menu";
import Link from "next/link";

const MessagesPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<number | null>(null);
    const [messageInput, setMessageInput] = useState("");

    // Handlers for navbar actions
    const handleWishlistClick = () => {
        // Add wishlist functionality here
        console.log('Wishlist clicked');
    };

    const handleCartClick = () => {
        // Add cart functionality here
        console.log('Cart clicked');
    };

    // Sample chat data
    const chats = [
        {
            id: 1,
            name: "Momo Hirai",
            avatar: "/api/placeholder/40/40",
            lastMessage: "Hi! Is the dining table still available?",
            time: "2:30 PM",
            unread: 2,
            online: true,
        },
        {
            id: 2,
            name: "Sana Minatozaki",
            avatar: "/api/placeholder/40/40",
            lastMessage: "Thanks for the quick response!",
            time: "1:15 PM",
            unread: 0,
            online: false,
        },
        {
            id: 3,
            name: "Mina Myoui",
            avatar: "/api/placeholder/40/40",
            lastMessage: "Can we schedule a pickup time?",
            time: "11:45 AM",
            unread: 1,
            online: true,
        },
        {
            id: 4,
            name: "Tzuyu Chou",
            avatar: "/api/placeholder/40/40",
            lastMessage: "The sofa looks great in the photos!",
            time: "Yesterday",
            unread: 0,
            online: false,
        },
    ];

    // Sample messages for selected chat
    const messages = [
        {
            id: 1,
            sender: "them",
            message:
                "Hi! I'm interested in your dining table. Is it still available?",
            time: "2:25 PM",
            avatar: "/api/placeholder/32/32",
        },
        {
            id: 2,
            sender: "me",
            message:
                "Yes, it's still available! Would you like to see more photos?",
            time: "2:27 PM",
        },
        {
            id: 3,
            sender: "them",
            message: "That would be great! Also, what's the condition like?",
            time: "2:28 PM",
            avatar: "/api/placeholder/32/32",
        },
        {
            id: 4,
            sender: "me",
            message:
                "It's in excellent condition. I can send you some detailed photos right now.",
            time: "2:29 PM",
        },
        {
            id: 5,
            sender: "them",
            message: "Perfect! And what about the pickup location?",
            time: "2:30 PM",
            avatar: "/api/placeholder/32/32",
        },
    ];

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            console.log("Sending message:", messageInput);
            setMessageInput("");
        }
    };

    const renderChatList = () => (
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-(--color-olive)">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.map((chat, index) => (
                    <div
                        key={chat.id}
                        onClick={() => setSelectedChat(index)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat === index
                            ? "bg-green-50 border-r-4 border-r-green"
                            : ""
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-medium">
                                        {chat.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </span>
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green rounded-full border-2 border-white"></div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {chat.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{chat.time}</p>
                                </div>
                                <p className="text-sm text-gray-600 truncate mt-1">
                                    {chat.lastMessage}
                                </p>
                            </div>

                            {chat.unread > 0 && (
                                <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderChatArea = () => {
        if (selectedChat === null) return null;
        const currentChat = chats[selectedChat];

        return (
            <div className="flex-1 flex flex-col bg-gray-50">
                
                {/* Mobile back button */}
                <div className="md:hidden bg-white border-b border-gray-200 p-2 flex items-center">
                    <button
                        onClick={() => setSelectedChat(null)}
                        className="text-green font-medium flex items-center space-x-2"
                    >
                        <span className="text-lg">←</span>
                        <span>Back</span>
                    </button>
                </div>

                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-sm">
                                    {currentChat.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </span>
                            </div>
                            {currentChat.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green rounded-full border-2 border-white"></div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{currentChat.name}</h3>
                            <p className="text-sm text-gray-500">
                                {currentChat.online ? "Online" : "Last seen recently"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Phone className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Video className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`flex items-end space-x-2 max-w-xs md:max-w-md ${message.sender === "me"
                                    ? "flex-row-reverse space-x-reverse"
                                    : ""
                                    }`}
                            >
                                {message.sender === "them" && (
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-gray-600 font-medium text-xs">
                                            {currentChat.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                )}

                                <div
                                    className={`px-4 py-2 rounded-2xl ${message.sender === "me"
                                        ? "bg-green text-white"
                                        : "bg-white text-gray-900 border border-gray-200"
                                        }`}
                                >
                                    <p className="text-sm">{message.message}</p>
                                </div>
                            </div>

                            <div
                                className={`text-xs text-gray-500 mt-1 ${message.sender === "me"
                                    ? "text-right mr-2"
                                    : "text-left ml-2"
                                    }`}
                            >
                                {message.time}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-50 rounded-full border border-gray-200 flex items-center px-4 py-2 ">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-600"
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            className="p-3 bg-green text-white rounded-full hover:bg-green transition-colors"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* NAVBAR */}
            <NavbarMenu 
                onWishlistClick={handleWishlistClick}
                onCartClick={handleCartClick}
            />

            <div className="flex justify-center">
                <div className="flex max-w-7xl w-full">
                    {/* Sidebar */}
                    <UserProfileSidebar
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                    />

                    {/* Main Content */}
                    <div className="flex-1 pt-20">
                        <div className="h-[calc(100vh-5rem)] flex">
                            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 m-4 sm:m-6 lg:m-8 overflow-hidden flex">
                                {/* Chat List */}
                                <div
                                    className={`${selectedChat !== null ? "hidden md:flex" : "flex"
                                        } flex-col w-full md:w-80`}
                                >
                                    {renderChatList()}
                                </div>

                                {/* Chat Area / Empty State */}
                                <div className="flex-1 flex flex-col">
                                    {selectedChat !== null ? (
                                        renderChatArea()
                                    ) : (
                                        <div className="flex flex-1 h-full bg-gray-50">
                                            <div className="flex flex-col items-center justify-center flex-1 text-center">
                                                <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    No conversation selected
                                                </h3>
                                                <p className="text-gray-600">
                                                    Choose a conversation from the left to start messaging
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MessagesPage;
