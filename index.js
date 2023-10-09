import fetch from 'node-fetch';
import https from 'https';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const checkTicketAvailability = (tanggale) => {
  fetch('https://ticket.kcic.co.id/ticket/ticketCache/query', {
    method: 'POST',
    agent: agent,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'id,fr;q=0.9,id-ID;q=0.8,en-US;q=0.7,en;q=0.6,ms;q=0.5',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'DNT': '1',
      'Origin': 'https://ticket.kcic.co.id',
      'Referer': 'https://ticket.kcic.co.id/webTrade/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      'appVersion': '1.0.001',
      'appVersionCode': '1',
      'deviceid': '00000000',
      'languageCode': 'id_ID',
      'platform': 'web',
      'saleMode': 'E',
      'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'versionNo': 'v1.0'
    },
    body: JSON.stringify({
      'trainDate': tanggale,
      'fromStationTelecode': 'IDHMA', // edit kalo mau ganti, ini kode Halim
      'toStationTelecode': 'IDTLA', // edit aja kalo mau, ini kode TegalLuar
      'sortord': '1',
      'ticketFlag': '0',
      'startTimeInterval': '00:00-24:00'
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Terjadi kesalahan saat mengambil data tiket');
      }
    })
    .then(data => {
        const jadwal = data.data;
        if (Array.isArray(jadwal) && jadwal.length > 0) {
          console.log('Tiket tersedia');
          //sendTelegramMessage(); //AKTIFIN dengan menghilangkan "//" sebelum "sendTelegramMessage();" KALO MAU ALA-ALA ALARM PENGINGAT
        } else {
          console.log('Tiket tidak tersedia');
          console.log(data);
          setTimeout(() => checkTicketAvailability(tanggale), 5000); // Melakukan permintaan setiap 5 detik
        }
      })
      .catch(error => {
        console.error('Terjadi kesalahan:', error);
      });
};

function askForDepartureDate() {
    return new Promise((resolve) => {
      rl.question('Masukkan tanggal keberangkatan (YYYYMMDD): ', (departureDateInput) => {
        const tanggale = departureDateInput;
        resolve(tanggale);
      });
    });
  }

  //Cara ngecek token bot dan cek chat id bisa ke web ini: https://blog.wadagizig.com/2017/11/membuat-bot-telegram-untuk-personal-notifications.html
function sendTelegramMessage() { 
    const url = 'https://api.telegram.org/botTOKEN/sendMessage'; // Ganti token Bot Telegram mu
  
    const sendMessage = async () => {
      const message = 'Jadwal tiket sudah tersedia.';
      const chatId = 'chatID'; // Ganti ID mu
  
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        });
  
        const data = await response.json();
        if (data.ok) {
          console.log('Pesan Telegram berhasil dikirim.');
        } else {
          throw new Error('Gagal mengirim pesan Telegram.');
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };
  
    sendMessage();
  }

  async function tickett() {
    try {
      console.log('Whoosh Ticket Checker (Alarm Tele) by AryaDS');
      console.log('-----------------------------------------------');
  
      const tanggale = await askForDepartureDate();
      console.log('Keberangkatan set default: Halim - TegalLuar');
      console.log('Mengecek jadwal...');

      checkTicketAvailability(tanggale);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      rl.close();
    }
  }
  
  tickett();