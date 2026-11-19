import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Barbershop database...');

  // 1. Seed Admin (dino911 / dino911dad)
  const newPasswordHash = await bcrypt.hash('dino911dad', 10);
  const dinoAdmin = await prisma.admin.findFirst({
    where: {
      OR: [
        { email: 'dino911' },
        { email: 'dino911@barber.uz' },
        { email: 'admin@barber.uz' }
      ]
    },
  });

  if (dinoAdmin) {
    await prisma.admin.update({
      where: { id: dinoAdmin.id },
      data: {
        email: 'dino911',
        passwordHash: newPasswordHash,
      },
    });
    console.log('Admin login updated to dino911 (Password: dino911dad)');
  } else {
    await prisma.admin.create({
      data: {
        email: 'dino911',
        passwordHash: newPasswordHash,
        role: 'ADMIN',
      },
    });
    console.log('Admin created: dino911 (Password: dino911dad)');
  }

  // 2. Seed Shop Settings
  const existingSettings = await prisma.shopSettings.findFirst();
  if (!existingSettings) {
    await prisma.shopSettings.create({
      data: {
        id: 'default',
        shopName: 'THE NOBLE BLADE',
        logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&auto=format&fit=crop&q=80',
        address: "Toshkent shahar, Mirobod tumani, Amir Temur shoh ko'chasi, 42-uy",
        phone: '+998 90 123 45 67',
        yandexMapsUrl: 'https://yandex.com/maps/10335/tashkent/?ll=69.279737%2C41.311158&z=16',
        googleMapsUrl: 'https://maps.google.com/?q=41.311158,69.279737',
        openingHours: 'Dushanba - Shanba: 09:00 - 21:00, Yakshanba: 10:00 - 19:00',
        instagramUrl: 'https://instagram.com/nobleblade_tashkent',
        telegramUrl: 'https://t.me/nobleblade_uz',
        description: "Toshkent markazidagi premium erkaklar barbershopi. An'anaviy ustara bilan soqol olish, zamonaviy soch turmaklari va shohona muhit.",
      },
    });
    console.log('Shop settings created.');
  }

  // 3. Seed Barbers
  const barbersData = [
    {
      fullName: 'Sardor Alimov',
      phone: '+998 90 111 22 33',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
      experience: '8 yil tajriba',
      description: 'Bosh barber va brend asoschisi. Klassik fade va aniq chiziqlar bo\'yicha xalqaro sertifikatlar sohibi.',
    },
    {
      fullName: 'Jasur Toshmatov',
      phone: '+998 93 444 55 66',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
      experience: '6 yil tajriba',
      description: 'Master barber. Royal issiq sochiqli soqol olish va soqol shakllantirish bo\'yicha yetakchi mutaxassis.',
    },
    {
      fullName: 'Azizbek Karimov',
      phone: '+998 97 777 88 99',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      experience: '5 yil tajriba',
      description: 'Zamonaviy trenddagi uslublar, teksturali soch turmaklari va yoshlar modasi bo\'yicha tajribali usta.',
    },
    {
      fullName: 'Farrux Normatov',
      phone: '+998 99 000 11 22',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      experience: '7 yil tajriba',
      description: 'Barber-stilist. Erkaklar soch bo\'yash, kulrang soch kamuflyaji va SPA parvarish ustasi.',
    },
  ];

  for (const b of barbersData) {
    let barber = await prisma.barber.findFirst({
      where: { fullName: b.fullName },
    });

    if (!barber) {
      barber = await prisma.barber.create({
        data: {
          fullName: b.fullName,
          phone: b.phone,
          image: b.image,
          experience: b.experience,
          description: b.description,
          isActive: true,
        },
      });

      // Weekly schedule
      for (let day = 0; day <= 6; day++) {
        const isSunday = day === 0;
        await prisma.barberSchedule.create({
          data: {
            barberId: barber.id,
            dayOfWeek: day,
            startTime: isSunday ? '10:00' : '09:00',
            endTime: isSunday ? '19:00' : '21:00',
            breakStart: '13:00',
            breakEnd: '14:00',
            isWorking: !isSunday || barber.fullName === 'Azizbek Karimov', // Azizbek works on Sunday
          },
        });
      }
      console.log(`Barber added: ${barber.fullName}`);
    } else {
      await prisma.barber.update({
        where: { id: barber.id },
        data: {
          phone: b.phone,
          image: b.image,
          experience: b.experience,
          description: b.description,
        },
      });
      console.log(`Barber updated: ${barber.fullName}`);
    }
  }

  // 4. Seed Services
  const servicesData = [
    {
      name: 'Klassik Soch Turmagi',
      description: 'Mijoz bosh suyagi shakliga moslashtirilgan soch turmagi, yuvish, stiling va parvarish.',
      image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80',
      price: 120000,
      duration: 45,
      category: 'Soch',
    },
    {
      name: 'Soqol Trim va Dizayn',
      description: 'Soqol chiziqlarini ustara bilan tekislash, hajm berish, oziqlantiruvchi moy va balzam.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
      price: 80000,
      duration: 45,
      category: 'Soqol',
    },
    {
      name: 'Qirollik Soqol Olishi (Royal Shave)',
      description: 'An\'anaviy xavfsiz ustara, issiq efir moyli sochiq kompressi, muzdek sochiq va yuz kremi.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
      price: 110000,
      duration: 45,
      category: 'Soqol',
    },
    {
      name: 'Premium Kompleks (Soch + Soqol)',
      description: 'Eng mashhur kombinatsiya: To\'liq soch turmagi, soqol dizayni, yuvish va bosh massaji.',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
      price: 180000,
      duration: 45,
      category: 'Kompleks',
    },
    {
      name: 'VIP Noble Blade Royal Paket',
      description: 'Soch turmagi, soqol olish, yuzni qora niqob bilan tozalash, yuz va bosh SPA massaji.',
      image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=600&auto=format&fit=crop&q=80',
      price: 250000,
      duration: 45,
      category: 'VIP',
    },
    {
      name: 'Bolalar Soch Turmagi (Junior Cut)',
      description: '3 yoshdan 12 yoshgacha bo\'lgan bolajonlar uchun sabr bilan va zamonaviy uslubda soch kesish.',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
      price: 90000,
      duration: 45,
      category: 'Soch',
    },
    {
      name: 'Soch Kulrangini Kamuflyaj Qilish',
      description: 'Oqarib qolgan sochlarni tabiiy erkaklar bo\'yog\'i bilan nozik va bilinmas tarzda yopish.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
      price: 130000,
      duration: 45,
      category: 'SPA & Rang',
    },
    {
      name: 'Qora Niqob & Yuz SPA Tozalash',
      description: 'Yuzdagi qora nuqtalarni tozalash, poralarni toraytirish va terini tetiklashtirish.',
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=80',
      price: 90000,
      duration: 45,
      category: 'SPA & Rang',
    },
  ];

  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({
      where: { name: s.name },
    });
    if (!existing) {
      await prisma.service.create({
        data: s,
      });
      console.log(`Service added: ${s.name}`);
    } else {
      await prisma.service.update({
        where: { id: existing.id },
        data: { image: s.image, description: s.description },
      });
    }
  }

  // 5. Seed sample clients and bookings for realistic analytics
  const clientsData = [
    { fullName: 'Bobur Mirzayev', phone: '+998 90 987 65 43' },
    { fullName: 'Davron Ahmedov', phone: '+998 91 234 56 78' },
    { fullName: 'Sanjar Rahimov', phone: '+998 93 345 67 89' },
    { fullName: 'Otabek Zokirov', phone: '+998 97 456 78 90' },
    { fullName: 'Sherzod Qobilov', phone: '+998 99 567 89 01' },
  ];

  const barbers = await prisma.barber.findMany();
  const services = await prisma.service.findMany();

  for (const c of clientsData) {
    let client = await prisma.user.findUnique({
      where: { phone: c.phone },
    });
    if (!client) {
      client = await prisma.user.create({
        data: c,
      });
    }

    // Create a confirmed or pending booking if user has no bookings
    const count = await prisma.booking.count({ where: { userId: client.id } });
    if (count === 0 && barbers.length > 0 && services.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      await prisma.booking.create({
        data: {
          userId: client.id,
          barberId: barbers[0].id,
          serviceId: services[0].price > 150000 ? services[0].id : services[3].id,
          date: today,
          startTime: '11:00',
          endTime: '11:45',
          peopleCount: 1,
          totalDuration: 45,
          totalPrice: services[3].price,
          status: 'CONFIRMED',
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
