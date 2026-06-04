import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Check if data already exists to prevent wiping in production on container restarts
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('Database already contains data. Skipping seeding to protect production data.');
    return;
  }

  // 2. Create Admin Account
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('AdminPassword123', adminSalt);
  const admin = await prisma.user.create({
    data: {
      name: 'Mehmet Kaya',
      email: 'admin@ainavigator.com',
      passwordHash: adminHash,
      role: 'admin'
    }
  });
  console.log('Created Admin:', admin.email);

  // 3. Create Student Account
  const studentSalt = await bcrypt.genSalt(10);
  const studentHash = await bcrypt.hash('OgrenciPassword123', studentSalt);
  const student = await prisma.user.create({
    data: {
      name: 'Esra Yılmaz',
      email: 'ogrenci@ainavigator.com',
      passwordHash: studentHash,
      role: 'student',
      className: '10-A',
      schoolNumber: '425'
    }
  });
  console.log('Created Student:', student.email);

  // 4. Create Quiz 1: Yapay Zekâ Temelleri ve Algoritmalar
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Yapay Zekâ Temelleri ve Algoritmalar',
      description: 'Yapay zekâ nedir, makine öğrenmesi ve veri ilişkisini ölçen temel seviye quiz.',
      isActive: true,
      source: 'manual',
      createdBy: admin.name,
      questions: {
        create: [
          {
            questionText: 'Yapay zekanın "öğrenme" sürecinde veriyi analiz ederek kalıpları (örüntüleri) bulmasını sağlayan alt dal hangisidir?',
            optionA: 'Derin Öğrenme',
            optionB: 'Makine Öğrenmesi',
            optionC: 'Doğal Dil İşleme',
            optionD: 'Robotik',
            correctOption: 'B',
            explanation: 'Makine öğrenmesi, sistemlerin doğrudan kodlanmak yerine veriden öğrenmesini ve kalıpları bulmasını sağlayan yapay zekâ dalıdır.',
            category: 'Makine Öğrenmesi',
            difficulty: 'kolay'
          },
          {
            questionText: 'Hangisi makine öğrenmesi algoritmalarının çalışabilmesi için en temel ve kritik gereksinimdir?',
            optionA: 'Çok hızlı bir internet bağlantısı',
            optionB: 'Kaliteli ve büyük miktarda veri',
            optionC: 'Büyük ekranlı bir bilgisayar',
            optionD: 'Aktif bir sosyal medya hesabı',
            correctOption: 'B',
            explanation: 'Makine öğrenmesinin en temel girdisi veridir. Algoritmaların örüntüleri öğrenebilmesi için kaliteli ve yeterli miktarda veriye ihtiyaç vardır.',
            category: 'Veri',
            difficulty: 'kolay'
          },
          {
            questionText: 'İnsan beynindeki nöronların çalışma yapısını taklit ederek karmaşık verileri işleyen yapay zekâ alt dalı hangisidir?',
            optionA: 'Uzman Sistemler',
            optionB: 'Görüntü İşleme',
            optionC: 'Derin Öğrenme (Yapay Sinir Ağları)',
            optionD: 'Arama Motoru Algoritmaları',
            correctOption: 'C',
            explanation: 'Derin öğrenme, çok katmanlı yapay sinir ağları kullanarak insan beyninin öğrenme şeklini taklit eden gelişmiş bir makine öğrenmesi alt dalıdır.',
            category: 'Derin Öğrenme',
            difficulty: 'orta'
          }
        ]
      }
    }
  });
  console.log('Created Quiz 1:', quiz1.title);

  // 5. Create Quiz 2: Yapay Zekâ Etiği ve Telif Hakları
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Yapay Zekâ Etiği ve Telif Hakları',
      description: 'Üretken yapay zekâ araçlarının telif hakları ve etik kurallara göre kullanım bilincini ölçen test.',
      isActive: true,
      source: 'manual',
      createdBy: admin.name,
      questions: {
        create: [
          {
            questionText: 'Görsel üreten yapay zekâ modellerinin günümüzde büyük telif hakkı tartışmalarına yol açmasının temel sebebi nedir?',
            optionA: 'Görselleri çok hızlı üretmeleri',
            optionB: 'Eğitim aşamasında sanatçıların telifli eserlerinin izinsiz kullanılması',
            optionC: 'Üretilen görsellerin çözünürlüğünün düşük olması',
            optionD: 'Yabancı dilde komutlarla çalışmaları',
            correctOption: 'B',
            explanation: 'Yapay zekâ modellerinin internetten toplanan ve telif hakkı olan milyonlarca sanat eserini yaratıcısından izin almadan ve ücret ödemeden eğitmesi telif hakkı ihlali tartışmalarının odağıdır.',
            category: 'Telif Hakları',
            difficulty: 'orta'
          },
          {
            questionText: 'Bir öğrencinin ödevinin tamamını yapay zekâ aracına yazdırıp, hiçbir düzeltme ve katkı yapmadan kendi çalışması gibi teslim etmesi hangi etik ilkeye aykırıdır?',
            optionA: 'Veri gizliliği',
            optionB: 'Akademik dürüstlük ve özgünlük',
            optionC: 'Siber güvenlik',
            optionD: 'Algoritmik taraflılık',
            correctOption: 'B',
            explanation: 'Yapay zekâ çıktılarını kendisi üretmiş gibi sunmak akademik dürüstlüğe aykırıdır ve intihal (aşırma) olarak değerlendirilir. Yapay zekâ sadece yardımcı bir araç olmalıdır.',
            category: 'Etik Kullanım',
            difficulty: 'orta'
          },
          {
            questionText: 'Telif hakkı olan bir metnin veya görselin yapay zekâ tarafından üretildiğini belirtmeden ticari bir amaçla kullanılması durumunda ne yapılmalıdır?',
            optionA: 'Yalnızca yapay zekâ aracının adı yazılmalıdır.',
            optionB: 'Kullanımı tamamen serbesttir, telif aranmaz.',
            optionC: 'Orijinal yaratıcıdan izin alınmalı veya yapay zekâ destekli içerik politikalarına uyulmalıdır.',
            optionD: 'İnternet adresi silinerek paylaşılmalıdır.',
            correctOption: 'C',
            explanation: 'Telif hakkı bulunan materyallerin yapay zekâ çıktıları içinde izinsiz kullanımı yasal sorunlar yaratabilir; izin alınmalı ve yapay zekâ kullanımı şeffafça beyan edilmelidir.',
            category: 'Telif Hakları',
            difficulty: 'zor'
          }
        ]
      }
    }
  });
  console.log('Created Quiz 2:', quiz2.title);

  // 6. Create Quiz 3: Deepfake ve Dijital Güvenlik
  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'Deepfake ve Dijital Güvenlik',
      description: 'Yapay zekâ kullanarak üretilen sahte içerikler (deepfake) ve dijital güvenlik önlemleri testi.',
      isActive: true,
      source: 'manual',
      createdBy: admin.name,
      questions: {
        create: [
          {
            questionText: 'Deepfake teknolojisi temel olarak hangi amaca hizmet eder?',
            optionA: 'Büyük boyutlu veritabanlarını şifrelemek için',
            optionB: 'Yapay sinir ağları ile sahte ve gerçekçi ses/video içerikleri üretmek için',
            optionC: 'Web sitelerinin yüklenme hızını artırmak için',
            optionD: 'Bilgisayarları zararlı virüslerden temizlemek için',
            correctOption: 'B',
            explanation: 'Deepfake, yapay sinir ağlarını kullanarak bir kişinin yüzünü veya sesini başka birinin yüzüne/sesine gerçekçi bir şekilde entegre etme teknolojisidir.',
            category: 'Deepfake',
            difficulty: 'kolay'
          },
          {
            questionText: 'Yapay zekâ sohbet robotlarına kişisel verileri (T.C. kimlik no, ev adresi, şifreler) girmek neden güvenlik riski oluşturur?',
            optionA: 'Sohbet robotunun yanıt verme hızını düşürür.',
            optionB: 'Bu veriler modelin geliştirilmesi için sunucularda saklanabilir ve olası sızıntılarda ele geçirilebilir.',
            optionC: 'Robotun Türkçe yerine İngilizce yanıt vermesine sebep olur.',
            optionD: 'Kullanıcı hesabının hemen silinmesine neden olur.',
            correctOption: 'B',
            explanation: 'Yapay zekâ sistemlerine girilen her bilgi (promptlar), model eğitimi için saklanıp işlenebilir. Bu yüzden hassas kişisel veriler kesinlikle girilmemelidir.',
            category: 'Veri Güvenliği',
            difficulty: 'orta'
          },
          {
            questionText: 'Sosyal medyada karşılaştığınız bir videonun deepfake (sahte) olup olmadığını anlamak için hangisi güvenilir bir yöntemdir?',
            optionA: 'Videonun çok fazla beğeni alıp almadığına bakmak',
            optionB: 'Yüz ifadelerindeki uyumsuzluklara, göz kırpma sıklığına ve ses-dudak senkronizasyonuna dikkat etmek',
            optionC: 'Videonun altındaki yorum sayısını kontrol etmek',
            optionD: 'Videoyu sadece telefon ekranından izlemek',
            correctOption: 'B',
            explanation: 'Deepfake videolarda genellikle göz kırpma sıklığı anormalliği, dudak hareketlerinin sesle uyuşmaması, kulak ve saç kenarlarındaki pürüzler sahteliği ele verir.',
            category: 'Deepfake',
            difficulty: 'zor'
          }
        ]
      }
    }
  });
  console.log('Created Quiz 3:', quiz3.title);

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
