const readline = require("readline");
const https = require("https");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const fetchGitHubEvents = (username) => {
    return new Promise((resolve, reject) => {
        const url = `https://api.github.com/users/${username}/events`;

        https
            .get(url, { headers: { "User-Agent": "node.js" } }, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(`Error: ${res.statusCode}`);
                    }
                });
            })
            .on("error", (err) => {
                reject(`Error: ${err.message}`);
            });
    });
};

const displayEvent = (events) => {
    const eventSummary = events.reduce((acc, event) => {
        const { type, repo } = event;
        const key = `${type} on ${repo.name}`;
        acc[key] = acc[key] ? acc[key] + 1 : 1;
        return acc;
    }, {});

    Object.entries(eventSummary).forEach(([key, count]) => {
        console.log(`${key} occurred ${count} times`);
    });
};

rl.question("Enter GitHub username: ", async (username) => {
    try {
        const events = await fetchGitHubEvents(username);
        displayEvent(events);
    } catch (error) {
        console.log(error.message);
    }

    rl.close();
});
