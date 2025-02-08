const users = [
  {
    id: 1,
    username: "alice",
    password: "password123",
    email: "alice@example.com",
    name: "Alice Johnson",
    profilePicture: "/src/assets/images/user1.jpg",
    bio: "Loving nature and photography",
    createdAt: "2025-02-01T12:00:00Z",
  },
  {
    id: 2,
    username: "bob",
    password: "securepassword",
    email: "bob@example.com",
    name: "Bob Smith",
    profilePicture: "/src/assets/images/user2.jpg",
    bio: "Tech enthusiast and gamer",
    createdAt: "2025-02-02T15:30:00Z",
  },
];

const posts = [
  {
    id: 1,
    userId: 1,
    content: "Check out this beautiful sunset!",
    image: "/src/assets/images/post1.jpg",
    createdAt: "2025-02-03T18:00:00Z",
    likes: [2],
    comments: [
      {
        id: 1,
        userId: 2,
        content: "Wow, that's amazing!",
        createdAt: "2025-02-03T19:00:00Z",
      },
    ],
  },
  {
    id: 2,
    userId: 2,
    content: "Just finished a great gaming session!",
    image: "/src/assets/images/post2.jpg",
    createdAt: "2025-02-04T20:00:00Z",
    likes: [1],
    comments: [],
  },
  {
    id: 3,
    userId: 2,
    content: "Mobil Baru cookkk!",
    image: "/src/assets/images/post3.jpg",
    createdAt: "2025-02-03T18:00:00Z",
    likes: [2],
    comments: [
      {
        id: 3,
        userId: 2,
        content: "Wow, that's amazing!",
        createdAt: "2025-02-03T19:00:00Z",
      },
    ],
  },
];

const authTokens = [
  {
    userId: 1,
    token: "abcd1234efgh5678",
    createdAt: "2025-02-01T12:30:00Z",
    expiresAt: "2025-02-08T12:30:00Z",
  },
];

export { users, posts, authTokens };
