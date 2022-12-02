const jwt = require('../modules/jwt');
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;
const fs = require("fs");
var users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
const Tasks1 = JSON.parse(fs.readFileSync("./Tasks1.json", "utf8"));

const authUtil = {
    checkToken: async (req, res, next) => {
        var token = req.headers.token;

        //console.log(token)

        // 토큰 없음
        if (!token)
            return res.send("No token")
        // decode
        const decoded = await jwt.verify(token);
        //console.log(decoded)
        // 유효기간 만료
        if (decoded === TOKEN_EXPIRED)
            return res.send("Expired token")
        // 유효하지 않는 토큰
        if (decoded === TOKEN_INVALID)
            return res.send("Invalid token")
        if (decoded.id === undefined)
            return res.send("Undefined token")
        req.id = decoded.id;

        /*
        for(var i=0;i<users.length;i++){
            users[i].new_index = i;
        }
        return res.json(users)
        */

        try {
            const return_value = await load_replica(String(req.headers.request_type));
            //console.log(return_value);
            return res.json(return_value);
        }
        catch (e) {
            return res.status(404).send("DB Not Found");
        }

        //next();
    }
}


const { PrismaClient: ReplicaPrismaClient } = require('../prisma/replicaClient/index.js');
const replicaClient = new ReplicaPrismaClient();

async function load_replica(request_type) {
    if (request_type == 'pilot') {
        const pilotResult = await replicaClient.Accounts.
            findMany({
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    createdAt: true,
                    profile: true
                }
            })

        for (var i = 0; i < pilotResult.length; i++) {
            try {
                pilotResult[i].profile = pilotResult[i].profile.value;
                delete pilotResult[i].profile.value;
            }
            catch (e) { }

            try {
                pilotResult[i].drone = pilotResult[i].profile.drones;
                delete pilotResult[i].profile.drones;
            }
            catch (e) { }

            try {
                pilotResult[i].career = pilotResult[i].profile.career;
                delete pilotResult[i].profile.career;
            }
            catch (e) { }

            try {
                pilotResult[i].area = pilotResult[i].profile.area;
                delete pilotResult[i].profile.area;
            }
            catch (e) { }

            try {
                pilotResult[i].region = pilotResult[i].profile.region;
                delete pilotResult[i].profile.region;
            }
            catch (e) { }
        }

        //console.log(pilotResult);
        return pilotResult;
    }

    if (request_type == 'taskgroup') {
        const tgResult = await replicaClient.TaskGroups.
            findMany({
                select: {
                    id: true,
                    name: true,
                    area: true,
                    status: true,
                    AccountId: true,
                    createdAt: true,
                    Accounts: {
                        select: {
                            name: true
                        }
                    }
                }
            })

        for (var i = 0; i < tgResult.length; i++) {
            try {
                tgResult[i].AccountName = tgResult[i].Accounts.name;
                delete tgResult[i].Accounts;
            }
            catch (e) { }
        }

        return tgResult;
    }

    if (request_type == 'task') {
        const taskResult = await replicaClient.Tasks.
            findMany({
                select: {
                    id: true,
                    name: true,
                    area: true,
                    status: true,
                    TaskGroupId: true,
                    AccountId: true,
                    createdAt: true,
                    Accounts: {
                        select: {
                            name: true
                        }
                    },
                    TaskGroups: {
                        select: {
                            name: true
                        }
                    }
                }
            })

        for (var i = 0; i < taskResult.length; i++) {
            try {
                taskResult[i].AccountName = taskResult[i].Accounts.name;
                delete taskResult[i].Accounts;
            }
            catch (e) { }

            try {
                taskResult[i].TGName = taskResult[i].TaskGroups.name;
                delete taskResult[i].TaskGroups;
            }
            catch (e) { }
        }

        //console.log(pilotResult);
        return taskResult;
    }

    if (request_type == 'taskdetail') {
        const tdResult = await replicaClient.TaskDetails.
            findMany({
                select: {
                    id: true,
                    address: true,
                    area: true,
                    status: true,
                    category: true,
                    memo: true,
                    etc: true,
                    AccountId: true,
                    TeamId: true,
                    TaskId: true,
                    createdAt: true,
                    Tasks: {
                        select: {
                            name: true,
                            TaskGroups: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            })

        for (var i = 0; i < tdResult.length; i++) {
            try {
                tdResult[i].TaskName = tdResult[i].Tasks.name;
            }
            catch (e) { }

            try {
                tdResult[i].TGName = tdResult[i].Tasks.TaskGroups.name;
                delete tdResult[i].Tasks;
            }
            catch (e) { }
        }

        //console.log(tdResult);
        return tdResult;
    }

    if (request_type == 'team') {
        const teamResult = await replicaClient.Teams.
            findMany({
                select: {
                    id: true,
                    name: true,
                    TaskId: true,
                    area: true,
                    AgentId: true,
                    AccountId: true,
                    status: true,
                    createdAt: true,
                    Tasks: {
                        select: {
                            name: true,
                            TaskGroups: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            })

        for (var i = 0; i < teamResult.length; i++) {
            try {
                teamResult[i].TaskName = teamResult[i].Tasks.name;
            }
            catch (e) { }

            try {
                teamResult[i].TGName = teamResult[i].Tasks.TaskGroups.name;
                delete teamResult[i].Tasks;
            }
            catch (e) { }
        }

        //console.log(pilotResult);
        return teamResult;
    }
}

module.exports = authUtil;