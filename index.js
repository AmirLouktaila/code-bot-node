const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
botToken = process.env.token;
const IdChannel = process.env.Idchannel;
const Channel = process.env.channel;
const link_cart = process.env.cart;
const bot = new Telegraf(botToken);

bot.command(['start', 'help'], async (ctx) => {
    const replyMarkup = await {
        inline_keyboard: [

            [{ text: 'اشترك في قناة', url: Channel }],
            [{ text: '🛒 تخفيض العملات على منتجات السلة 🛒', callback_data: 'cart' },],

        ],
    };

 

    const welcomeMessage = `
        مرحبًا بكم في بوت 
        مهمة هذا البوت 🤖 معرفة أقل سعر للمنتج المراد شراءه 😍 حيث يعطيك 3 روابط
        ⏪رابط تخفيض النقاط (العملات) حيث يقوم بزيادة التخفيض من 1%-2% لتصل حتى الى 24% حسب المنتج 🔥
        ⏪رابط عروض السوبر 🔥
        ⏪ رابط العرض المحدود 🔥
        🔴انسخ رابط المنتج وضعه في البوت وقارن بين الروابط الثلاث واشتري بأقل سعر وقم بتثبيت البوت (épinglée) لتسهيل استعماله.
    `;

    await ctx.reply(welcomeMessage, { reply_markup: replyMarkup });
});

bot.action("cart", (ctx) => {
    // ctx.answerCbQuery('Button pressed!');
    const cartMessage = `
            طريقة الاستفادة من تخفيض العملات على منتجات السلة
            🔸 أولاً ادخل إلى تطبيق Aliexpress ثم السلة واختر المنتجات
            🔸 ثانيًا ادخل من هذا الرابط ${link_cart}بعد ذلك اضغط على الزر "payer" أو "دفع"
            🔸 بعد ظهور صفحة الدفع، اضغط على أيقونة المشاركة في الأعلى وقم بنسخ الرابط
            🔸 ثم قم بلصق الرابط هنا في البوت وانتظر لحظة حتى يعطيك رابطًا آخر للدخول من خلاله وستجد السعر قد انخفض
        `;

    ctx.reply(cartMessage);
})
async function isUserSubscribed(user_id) {
    try {
        const user_info = await bot.telegram.getChatMember(IdChannel, user_id);
        console.log(user_info);
        return ['member', 'administrator', 'creator'].includes(user_info.status);
    } catch (e) {
        console.error(`حدث خطأ: ${e.message}`);
        return false;
    }
}
async function sendPhotoAndMessage(ctx, img_s, messageLink, replyMarkup1) {
    try {
        // إرسال الصورة
        await ctx.sendPhoto({ url: img_s });

        // إرسال النص بعد الصورة
        await ctx.sendMessage(messageLink, { reply_markup: replyMarkup1 });
    } catch (error) {
        console.error('Error sending photo and message:', error);
        // يمكنك إضافة إجراءات إضافية هنا إذا كنت ترغب في التعامل مع الأخطاء
    }
}

bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;
    const userIdToCheck = ctx.message.from.id;

    if (await isUserSubscribed(userIdToCheck)) {
        console.log('t')
        try {
            if (text === "/start") {
                console.log("ok");
            } else {
  
        

                    try {

                        const getLinkId = (link) => {
                            if (link.includes("/item/") || link.includes("/i/")) {
                                const extractItem = (text) => {
                                    if (text.includes("/i/")) {
                                        const startIndex = text.indexOf('/i/') + '/i/'.length;
                                        const endIndex = text.indexOf('.', startIndex);
                                        if (startIndex !== -1 && endIndex !== -1) {
                                            const extractedText = text.substring(startIndex, endIndex);
                                            return extractedText;
                                        } else {
                                            return null;
                                        }
                                    } else if (text.includes("/item/")) {
                                        const startIndex = text.indexOf('/item/') + '/item/'.length;
                                        const endIndex = text.indexOf('.', startIndex);
                                        if (startIndex !== -1 && endIndex !== -1) {
                                            const extractedText = text.substring(startIndex, endIndex);
                                            return extractedText;
                                        } else {
                                            return null;
                                        }
                                    }
                                };

                                const inputText = link;
                                const extractedItem = extractItem(inputText);
                                return extractedItem;
                            } else if (link.includes("https://campaign.aliexpress.com/wow/")) {
                                const campaign = (url) => {
                                    const text = url;
                                    const match = text.match(/productIds=(.*?)&/);
                                    if (match) {
                                        const productIds = match[1];
                                        return productIds;
                                    } else {
                                        return null;
                                    }
                                };

                                const textCampaign = link;
                                const campaignAliexpress = campaign(textCampaign);
                                return campaignAliexpress;
                            } else if (link.includes("/share/")) {
                                const getNumbers = (urls) => {
                                    const url = urls;
                                    const numbers = url.match(/\d+/g);
                                    for (const num of numbers) {
                                        if (num.startsWith("100500") && num.length === 16) {
                                            return num;
                                        }
                                    }
                                };

                                const urlAff = getNumbers(link);
                                return urlAff;
                            }
                        };



                        console.log(ctx.message.from);
                        // ctx.message.text
                        ctx.reply('انتظر قليلا ...')
                            .then((message) => {

                                const extractedLinks = [ctx.message.text]; // Replace with your actual extracted links
                                axios.get(extractedLinks[0], { allowRedirects: true })
                                    .then(response => {

                                        const result = getLinkId(response.data);
                                        console.log(result);


                                        affData.getData(result)
                                            .then((coinPi) => {
                                                console.log("coinPi : ", coinPi)
                                                ctx.deleteMessage(message.message_id)
                                                    .then(() => {
                                                        ctx.replyWithPhoto({ url: coinPi.info.normal.image },
                                                            {


                                                                caption: `
<b>>-----------« تخفيض الاسعار 🎉 »>-----------</b>
${coinPi.info.normal.name}

السعر الاصلي : (${coinPi.info.normal.price})
التقييم : ${coinPi.info.normal.rate}
التقييمات : ${coinPi.info.normal.totalRates}
<b>----------- | ✨ المتجر ✨ | -----------</b>

✈️ الشحن : ${coinPi.info.normal.shipping}
🛒 إسم المتجر : ${coinPi.info.normal.store}
📊 معدل تقييم المتجر : ${coinPi.info.normal.storeRate}
<b>----------- | ✨ التخفيضات ✨ | -----------</b>

عدد المبيعات : ${coinPi.info.normal.sales}
🏷 نسبة تخفيض بالعملات قبل  :  (${coinPi.info.normal.discount})
🏷 نسبة تخفيض بعد  : (${coinPi.info.points.discount})

🌟رابط تخفيض النقاط: ${coinPi.info.points.discountPrice}
${coinPi.aff.points}

🔥 رابط تخفيض السوبر: ${coinPi.info.super.price}
${coinPi.aff.super}

📌رابط العرض المحدود: ${coinPi.info.limited.price}
${coinPi.aff.limited}

` ,
                                                                parse_mode: "HTML",
                                                                ...Markup.inlineKeyboard([
                                                                    Markup.button.callback("🛒 تخفيض العملات على منتجات السلة 🛒", "cart"),

                                                                ])
                                                            });
                                                    })

                                            });
                                    });

                            })
                            .catch(error => {
                                // Handle errors here
                                console.error(error.message);
                            });
                        // ctx.sendPhoto({ url: img_s });
                        // ctx.sendMessage(messageLink, { reply_markup: replyMarkup1 });
                    } catch (error) {
                        const messageLink = `
🌟رابط تخفيض النقاط: ${coinPi.info.points.discount}
${coinPi.aff.points}

🔥 رابط تخفيض السوبر: ${coinPi.info.super.price}
${coinPi.aff.super}

📌رابط العرض المحدود: ${coinPi.info.limited.price}
${coinPi.aff.limited}

                    `;
                        ctx.reply(messageLink);
                    }
                
            }
        } catch (e) {
            ctx.reply('حدث خطأ غير متوقع');
        }
    } else {
        const replyMarkup2 = {
            inline_keyboard: [
                [{ text: 'اشتراك', url: Channel }],
            ],
        };
        ctx.reply(' اأنت غير مشترك في القناة.',{reply_markup:replyMarkup2});
    }
});
bot.launch({ webhook: { domain: process.env.RENDER_EXTERNAL_URL, port: process.env.PORT }, allowedUpdates: ['message', 'callback_query'], })
    .then(() => {
        console.log('Bot is running');
    })
    .catch((error) => {
        console.error('Error starting the bot:', error);
    });