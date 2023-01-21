module.exports = function (args){
    let day = new Date().getDay();
    if( day === 4 ){
        if( juevesCount == 0 ){
            message.channel.send(`🥳🎉🎈 FELIZ JUEVES, GENTLEMEN!!!!! 🎈🎉🥳\n 💃🏼 AFTER 6 LONG DAYS, WE'VE FINALLY MADE IT 💃🏼`);
        }
        juevesCount++;
        return quotes.sayQuote( quotesList_Dict["jueves"], args[1])
        
    }else if( day === 2 || day === 3){
        juevesCount = 0;
        return 'https://i.imgur.com/scXCY8u.jpg'
    }else{
        juevesCount = 0;
        // return 'https://i.imgur.com/Ihs2N1T.mp4'
        return 'https://i.imgur.com/LQ4hXGa.jpg'
    }
}