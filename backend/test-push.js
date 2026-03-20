require('dotenv').config();
const webpush = require('web-push');
const mongoose = require('mongoose');
const User = require('./models/User');

const testPush = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const users = await User.find({ pushSubscriptions: { $not: { $size: 0 } } });
    if (users.length === 0) {
      console.log('No users with push subscriptions found.');
      process.exit(0);
    }

    const HINGLISH_ROASTS = [
      "Girlfriend kat ke chali gayi to kya hua? Expenses add kiye ki nahi?",
      "Bhai itna kharcha kar raha hai, thoda hisaab bhi likh le. Ambani ki aulaad hai kya?",
      "Zomato se roz order karke garibi ka rona mat ro. Expenses daal pehle!",
      "Dosto pe paise uda diye aur ab darr lag raha hai? Likh le bhai hisaab mein!",
      "Paise ped pe nahi ughte, lekin teri jeb se ud zaroor rahe hain. Record kar le!",
      "Gareebi aane mein der nahi lagti, expenses track karna shuru kar de!",
      "Sirf reels dekhne se bank balance nahi badhega. Kharcha likh le chup chap.",
      "Babu ne khana khaya ya nahi usse pehle dekh le bank mein paise bache hai ya nahi!",
      "Ameer dikhne ki aadat teri kis din sadak pe layegi. Expenses update kar!",
      "Weekend pe itna uda diya, ab Monday rote rote katega. Entry toh kar le kam se kam.",
      "EMI ka message aane se pehle expense app mein entry maar le bhai.",
      "Phone mehenga, kapde mehenge, bank balance dekha hai apna? Expense likh!",
      "Kya matlab paise aate hi dosto ke sath party karni hai? Budget kahan hai?",
      "Ghar walo ko pata chala na itna kahan udd raha hai, toh ghar se nikaal denge. Entry kar!",
      "Bhai tujhe track nahi karna apni barbaadi? Expenses add kar!",
      "Itna aalsi mat ban, sirf do button dabane hain. Kharcha note kar le.",
      "Chai sutte ka hisaab kaun likhega? Wo bhi teri hi jeb se jaa raha hai.",
      "Sale aati jaati rahengi, tera budget nahi aayega wapas. Update maar!",
      "Khali pocket, badi baatein. Likh le bhai expenses apne.",
      "Duniya aage badh gayi tu wahi atka hai, expenses track kar le varna rota rahega.",
      "Apan middle class hain bhai, hisaab se hi zinda hain. App me dal de aaj ka kharcha.",
      "Agar aaj expense nahi add kiya, toh samajh le agle mahine maggi pe zinda rehna padega.",
      "Sapne Lamborghini ke aur bank balance Nano wala. Likh le expenses!",
      "Kanjusi nahi, smart spending bolte hai isko. Pata lagta hai tujhe khud hi nahi pata, likh le pehle.",
      "Tu fir se bahar khana kha raha hai na? Maa ki daal chawal mein kya burai hai? Likh idhar!",
      "Paise haath ka mail hai... aur tere haath to bahut saaf rehne lage hain aajkal. Track kar!",
      "Credit card ka bill aayega tab asu niklenge. Abhi se expense track kar le.",
      "Bhai tu Goa ka plan to bana raha hai, pehle pichle mahine ka hisaab to clear kar le.",
      "Zindagi me ek hi dukh hai - 'Paise gaye kahan?' Bhai track karega tabhi to pata chalega!",
      "Agle mahine savings pakka? Ye dialogue main pichle 2 saal se sun raha hu. Entry kar apni!",
      "Tujhse acha to paan wala book maintain karta hai. FinKart pe entry kon marega?",
      "Ghar pe jhoot bol ke paise liye the dosto mein udane? Idhar sach likh le kam se kam.",
      "Aaj nahi add karoge toh kab karoge? Jab recovery agent darwaze pe khada hoga?",
      "Ghoomna firna chalte rahega, expenses ka column khali kyu pada hai?",
      "Paisa bolta hai, aur tera paisa bol raha hai 'Bye Bye'. Record to kar le!",
      "Agar tera dimaag expenses yaad rakh pata, toh tu abhi billionare hota. So add kar le app mein.",
      "Apne future pe rehem kha. Aaj ka kharcha add kar aur budget samajh.",
      "Saste me niptane ke chakkar me 2 baar kharcha kar baitha na? Likh usee bhi.",
      "Tinder pe match aane se pehle tera bank account null match de dega. Expense note kar!",
      "Dekh bhai, jhut nahi bolunga, teri financial planning joke ban gayi hai. Update expenses!",
      "Kaash teri income utni tezi se badhti jitni tezi se tu paise udata hai. Entry kar!",
      "Mahine ke aakiri 10 din kaise survive karega? Kharcha track nahi kiya to wande lagenge.",
      "Apna time aayega... par tab tak bank balance chala na jaye. Expense daal de bhai.",
      "Tu wahi galti roz karta hai na? Paise kharch aur record zero. Karde entry aaj toh.",
      "Maa baap ke taano se thoda break chahiye to expense maintain karna seekh le.",
      "Bhai tu startup kholne waala tha na? Pehle 100 rupaye ka hisaab lagana seekh le.",
      "Baal jhad rahe hai tension se, aur tension paise ki hai. Trace this money honey!",
      "Bas kar pagle, aur kitna lutayega market mein? Hisaab to rakh thoda.",
      "Tu sachme gareeb hai ya banne ki acting kar raha hai? Expense track karke bata mujhe.",
      "Jo bacha hai usko bacha le. FinKart me kharcha add kar aur aukat me reh ke spend kar."
    ];

    const randomRoast = HINGLISH_ROASTS[Math.floor(Math.random() * HINGLISH_ROASTS.length)];
    console.log(`Found ${users.length} users with subscriptions. Sending test push...`);

    const payload = JSON.stringify({
      title: 'Aukaat me reh thoda! 💸',
      body: randomRoast,
      icon: '/favicon.ico',
    });

    for (const user of users) {
      for (const sub of user.pushSubscriptions) {
        await webpush.sendNotification(sub, payload);
        console.log(`Push sent to ${user.email}`);
      }
    }

    console.log('Test complete.');
    process.exit(0);
  } catch (error) {
    console.error('Test Push Error:', error);
    process.exit(1);
  }
};

testPush();
