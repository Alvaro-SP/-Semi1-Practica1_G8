import AWS from'aws-sdk'


AWS.config.update({
    region: 'us-east-1', // La región donde se creo el bot
    accessKeyId: 'AKIA2R37HQXTCPY4WGSF',
    secretAccessKey: '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'
});

const lexruntime = new AWS.LexRuntime();

const postchatbot = async (message) => {
    try {
        const params = {
            botAlias: 'aliasbotsemi',
            botName: 'chatbotg8semi',
            inputText: message,
            userId: '123456789',
        };

        lexruntime.postText(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                return { Res: false };
            } else {
                console.log(data);
                return (data);
            }
        });
        return { Res: false };
    } catch (error) {
        console.log(error);
        return { Res: false };
    }
}

export { postchatbot }