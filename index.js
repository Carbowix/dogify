const request = require("https");
const cheerio = require("cheerio");
const dogStuff = require("./dogStuff.json");
const dogFaces = require("./dogFaces.json");
const randomImageUrl = "https://dog.ceo/api/";
const randomDogFactUrl = "https://some-random-api.ml/facts/dog";
const dogNameUrl = "https://www.mydogsname.com/";
const ERR_MSG = "No response from the API"
const randomSelection = (choices) => choices[Math.floor(Math.random() * choices.length)];

module.exports = {
    randomDogImg: () => {
        return new Promise((resolve, reject) => {
            let url = randomImageUrl + "breeds/image/random"
            processRequest(url).then(res => {
                resolve(res.message)
            }).catch(reject(new Error(ERR_MSG)))
        });
    },

    randomDogImgByBreed: (breed) => {
        return new Promise((resolve, reject) => {
            let url = randomImageUrl + "breed" + breed + "/image/random"
            processRequest(url).then(res => {
                resolve(res.message)
            }).catch(reject(new Error(ERR_MSG)))
        });
    },

    randomDogAsciiFace: () => { // Credits to https://www.npmjs.com/package/dog-ascii-faces
        return randomSelection(dogFaces["faces"]);
    },

    randomDogBreed: () => {
        return randomSelection(dogStuff['breeds'])
    },

    randomDogFact: () => {
        return new Promise((resolve, reject) => {
            processRequest(randomDogFactUrl).then(res => {
                resolve(res.fact)
            }).catch(reject(new Error(ERR_MSG)))
        });
    },

    suggestDogName: (gender, characteristics) => {
        return new Promise((resolve, reject) => {
            let availableC = [];
            if (!dogStuff["gender"].includes(gender.toLowerCase())) {
                reject(new TypeError(`Invalid gender, Available Genders: ${dogStuff["gender"].map((g) => g)}`));
            }

            if (!characteristics || characteristics.length < 1) {
                reject(new TypeError(`Charateristics are required to find a name, Available Characteristics: ${dogStuff["characteristics"].map((c) => c)}, and Available Themes: ${dogStuff["themes"].map((t) => t)}`));
            }

            characteristics.forEach((c) => {
                if (!dogStuff["characteristics"].includes(c)) {
                    if (!dogStuff["themes"].includes(c)) {
                        console.log(`Invalid Characteristic ${c} was entered.`);
                    } else {
                        availableC.push(c);
                    }
                } else {
                    availableC.push(c);
                }
            });
            if (availableC.length > 0) {
                request.get(dogNameUrl + "names/?gender=" + gender + "&q=" + availableC.map((c) => c).join("-"), (res) => {
                    if (res.statusCode === 200) {
                        res.setEncoding("utf-8");
                        res.on("data", (d) => {
                            let names = [];
                            const $ = cheerio.load(d);
                            $("label").each(function (i, e) {
                                names.push($(e).text());
                            });
                            resolve(names);
                        });
                    } else {
                        reject(new Error("No response for DOGS NAME API, try again later."));
                    }
                });
            } else {
                reject(new TypeError("All characteristics were invalid."));
            }
        });
    },

    getDogNameCharacteristics: () => {
        return dogStuff["characteristics"];
    },

    getDogNameThemes: () => {
        return dogStuff["themes"];
    }
};

function processRequest(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (res) => {
            if (res.statusCode === 200) {
                res.setEncoding('utf-8');
                res.on('data', res => {
                    res = JSON.parse(res)
                    resolve(res)
                })
            } else {
                reject(res.statusCode)
            }
        })
    })
}