import AWS from'aws-sdk'


AWS.config.update({
    region: 'us-east-1', // La región donde se creo el bot
    accessKeyId: 'AKIARHSIZASZYK6DQ5EY',
    secretAccessKey: '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'
});

const lexruntime = new AWS.LexRuntimeV2();

const postchatbot = async (message) => {
    return new Promise((resolve, reject) => {
        try {
            const params = {
                botAliasId: 'BRINKTKLPE',
                localeId: 'es_419',
                text: message,
                botId: 'MAQQSYQLV7',
                sessionId: '123456789',
            };

            lexruntime.recognizeText(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                } else {
                    //console.log(data.messages[0].content);
                    //message(data.messages[0].content)
                    resolve(data.messages[0].content);
                }
            });

            //return { Res: false };
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

export { postchatbot }