import { config } from "dotenv";
import User from "../model/users.js";
import bcrypt from "bcrypt";

try {

    config();
    const seedUsers = [
        // Female Users
        {
            userId: "U1001",
            username: "emma.thompson",
            email: "emma.thompson@example.com",
            fullName: "Emma Thompson",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
        },
        {
            userId: "U1002",
            username: "olivia.miller",
            email: "olivia.miller@example.com",
            fullName: "Olivia Miller",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
        },
        {
            userId: "U1003",
            username: "sophia.davis",
            email: "sophia.davis@example.com",
            fullName: "Sophia Davis",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
        },
        {
            userId: "U1004",
            username: "ava.wilson",
            email: "ava.wilson@example.com",
            fullName: "Ava Wilson",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
        },
        {
            userId: "U1005",
            username: "isabella.brown",
            email: "isabella.brown@example.com",
            fullName: "Isabella Brown",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
        },
        {
            userId: "U1006",
            username: "mia.johnson",
            email: "mia.johnson@example.com",
            fullName: "Mia Johnson",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
        },
        {
            userId: "U1007",
            username: "charlotte.williams",
            email: "charlotte.williams@example.com",
            fullName: "Charlotte Williams",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
        },
        {
            userId: "U1008",
            username: "amelia.garcia",
            email: "amelia.garcia@example.com",
            fullName: "Amelia Garcia",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
        },

        // Male Users
        {
            userId: "U1009",
            username: "james.anderson",
            email: "james.anderson@example.com",
            fullName: "James Anderson",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
            userId: "U1010",
            username: "william.clark",
            email: "william.clark@example.com",
            fullName: "William Clark",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
        },
        {
            userId: "U1011",
            username: "benjamin.taylor",
            email: "benjamin.taylor@example.com",
            fullName: "Benjamin Taylor",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
        },
        {
            userId: "U1012",
            username: "lucas.moore",
            email: "lucas.moore@example.com",
            fullName: "Lucas Moore",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
        },
        {
            userId: "U1013",
            username: "henry.jackson",
            email: "henry.jackson@example.com",
            fullName: "Henry Jackson",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
        },
        {
            userId: "U1014",
            username: "alexander.martin",
            email: "alexander.martin@example.com",
            fullName: "Alexander Martin",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
        },
        {
            userId: "U1015",
            username: "daniel.rodriguez",
            email: "daniel.rodriguez@example.com",
            fullName: "Daniel Rodriguez",
            password: "123456",
            profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
        },
    ];

    const seedDatabase = async () => {
        try {
            console.log("Clearing old users...");
            await User.deleteMany({});

            const hashedUsers = [];

            for (let u of seedUsers) {
                const hashedPassword = await bcrypt.hash(u.password, 10);

                hashedUsers.push({
                    ...u,
                    password: hashedPassword
                });
            }

            await User.insertMany(hashedUsers);

            console.log("✅ Done seeding with hashed passwords!");
            process.exit(0);
        } catch (error) {
            console.log("❌ Error:", error);
            process.exit(1);
        }
    };
    seedDatabase();
}
catch (err) {
    console.log(`we have error in userSeeds.js :${err}`)
}

// Call the function
// seedDatabase();
