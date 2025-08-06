// Скрипт инициализации MongoDB
db = db.getSiblingDB('equestrian_crm');

// Создаем администратора
db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'equestrian_crm'
    }
  ]
});

// Создаем образец пользователя-администратора
db.users.insertOne({
  first_name: 'Администратор',
  last_name: 'Системы',
  email: 'admin@example.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // password123
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Создаем образцы лошадей
db.horses.insertMany([
  {
    name: 'Гром',
    breed: 'Чистокровная верховая',
    age: 8,
    gender: 'gelding',
    color: 'Гнедая',
    boardingType: 'full',
    stallNumber: 'С01',
    medicalNotes: 'Нет известных аллергий. Требуются регулярные упражнения.',
    vaccinationStatus: 'current',
    lastVetVisit: new Date('2024-11-15'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Лунный свет',
    breed: 'Арабская',
    age: 12,
    gender: 'mare',
    color: 'Серая',
    boardingType: 'full',
    stallNumber: 'С02',
    medicalNotes: 'Артрит левой передней ноги. Требуются добавки для суставов.',
    vaccinationStatus: 'current',
    lastVetVisit: new Date('2024-11-10'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Звезда',
    breed: 'Квотерхорс',
    age: 6,
    gender: 'mare',
    color: 'Рыжая',
    boardingType: 'partial',
    stallNumber: 'С03',
    medicalNotes: 'Здоровая лошадь, текущих медицинских проблем нет.',
    vaccinationStatus: 'due',
    lastVetVisit: new Date('2024-10-20'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('База данных инициализирована с образцами данных');