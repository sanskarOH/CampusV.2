import { PrismaClient } from '@prisma/client'
import { hashPassword } from "@/lib/password"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hashPassword("123456")

// USERS
const admin = await prisma.user.create({
data: {
name: "Admin User",
email: "[admin@test.com](mailto:admin@test.com)",
password: hashedPassword,
role: "ADMIN",
status: "ACTIVE"
}
})

const organizer = await prisma.user.create({
data: {
name: "Event Organizer",
email: "[organizer@test.com](mailto:organizer@test.com)",
password: hashedPassword,
role: "ORGANIZER",
status: "ACTIVE"
}
})

const students = await Promise.all(
Array.from({ length: 10 }).map((_, i) =>
prisma.user.create({
data: {
name: `Student ${i + 1}`,
email: `student${i + 1}@test.com`,
password: hashedPassword,
role: "STUDENT",
status: "ACTIVE"
}
})
)
)

// EVENTS
const events = await Promise.all([
  prisma.event.create({
  data: {
  title: "Tech Fest 2026",
  description: "Annual college tech fest with coding competitions",
  category: "TECH",
  date: new Date("2026-05-10"),
  seats: 100,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Cultural Night",
  description: "Dance, music, and performances",
  category: "CULTURAL",
  date: new Date("2026-05-15"),
  seats: 50,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Hackathon 24hr",
  description: "Build innovative solutions in 24 hours",
  category: "TECH",
  date: new Date("2026-06-01"),
  seats: 30,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "AI Workshop",
  description: "Hands-on AI and ML workshop",
  category: "WORKSHOP",
  date: new Date("2026-06-05"),
  seats: 60,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Startup Pitch",
  description: "Pitch your startup ideas",
  category: "BUSINESS",
  date: new Date("2026-06-10"),
  seats: 40,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Football Tournament",
  description: "Inter-college football competition",
  category: "SPORTS",
  date: new Date("2026-06-12"),
  seats: 120,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Basketball League",
  description: "Competitive basketball matches",
  category: "SPORTS",
  date: new Date("2026-06-15"),
  seats: 100,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Photography Contest",
  description: "Capture the best moments",
  category: "CULTURAL",
  date: new Date("2026-06-18"),
  seats: 80,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Robotics Challenge",
  description: "Build and compete with robots",
  category: "TECH",
  date: new Date("2026-06-20"),
  seats: 50,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Debate Competition",
  description: "Show your argument skills",
  category: "ACADEMIC",
  date: new Date("2026-06-22"),
  seats: 70,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Coding Contest",
  description: "Solve algorithmic problems",
  category: "TECH",
  date: new Date("2026-06-25"),
  seats: 150,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Music Fest",
  description: "Live music performances",
  category: "CULTURAL",
  date: new Date("2026-06-28"),
  seats: 200,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Art Exhibition",
  description: "Display creative artworks",
  category: "CULTURAL",
  date: new Date("2026-07-01"),
  seats: 90,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Entrepreneurship Workshop",
  description: "Learn business fundamentals",
  category: "BUSINESS",
  date: new Date("2026-07-03"),
  seats: 60,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Gaming Tournament",
  description: "Compete in esports",
  category: "TECH",
  date: new Date("2026-07-05"),
  seats: 120,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Yoga Session",
  description: "Relax and rejuvenate",
  category: "WELLNESS",
  date: new Date("2026-07-07"),
  seats: 40,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Public Speaking Workshop",
  description: "Improve communication skills",
  category: "ACADEMIC",
  date: new Date("2026-07-10"),
  seats: 50,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Science Fair",
  description: "Showcase scientific projects",
  category: "ACADEMIC",
  date: new Date("2026-07-12"),
  seats: 100,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Marathon",
  description: "5km campus marathon",
  category: "SPORTS",
  date: new Date("2026-07-15"),
  seats: 200,
  organizerId: organizer.id
  }
  }),
  prisma.event.create({
  data: {
  title: "Film Screening",
  description: "Movie night with discussion",
  category: "CULTURAL",
  date: new Date("2026-07-18"),
  seats: 80,
  organizerId: organizer.id
  }
  })
  ])
  

// REGISTRATIONS
await prisma.registration.createMany({
data: [
{
userId: students[0].id,
eventId: events[0].id,
status: "REGISTERED"
},
{
userId: students[1].id,
eventId: events[1].id,
status: "REGISTERED"
},
{
userId: students[2].id,
eventId: events[2].id,
status: "REGISTERED"
}
]
})

// FEEDBACK
await prisma.feedback.create({
data: {
userId: students[0].id,
eventId: events[0].id,
rating: 5,
comment: "Amazing event, well organized!"
}
})

// NOTIFICATIONS
await prisma.notification.createMany({
data: [
{
userId: students[0].id,
message: "You have successfully registered for Tech Fest"
},
{
userId: students[1].id,
message: "Cultural Night starts soon!"
}
]
})

console.log("🌱 Seed data inserted successfully")
}

main()
.catch((e) => {
console.error(e)
process.exit(1)
})
.finally(async () => {
await prisma.$disconnect()
})
