export const endpoints = {
    // auth
    signup: "/auth/signup",
    login: "/auth/login",
    checkAuth: "/auth/check",
    logout: "/auth/logout",

    // user / profile
    updateUsername: "/user/update-username",
    updateProfilePic: "/user/update-profile-pic",
    profileImage: "/user/profile-image",
    profileImages: (username) => `/user/profile-images/${username}`,

    // users
    searchUsers: (query) => `/users/search?query=${encodeURIComponent(query)}`,

    // conversations
    conversationsForUser: (username) => `/conversations/user/${username}`,
    updateConversation: "/conversations/update",

    // messages
    messagesBetween: (username, otherUsername) => `/messages/${username}/${otherUsername}`,
    messages: "/messages",
    markMessagesSeen: "/messages/mark-seen",
    deleteMessage: (id) => `/messages/${id}`,
};
