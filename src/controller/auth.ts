import { decode, verify } from "jsonwebtoken";

export const Authorize = (handler: (request, reply, next) => void) => {
    return (request, reply, next) => {
        if (!request.headers['authorization']) {
            return reply.code(401).send("https://http.cat/401");
        };

        const token = request.headers['authorization'] + "";
        if (!token.startsWith('Bearer ')) {
            return reply.code(401).send("https://http.cat/401");
        }

        try {
            if (!verify(token.replace('Bearer ', ''), process.env.AUTH_TOKEN)) {
                console.log('neg veri');
                return reply.code(401).send("https://http.cat/401");
            }

            request['user_id'] = decode(token.replace('Bearer ', ''))['id'];

            return handler(request, reply, next);
        } catch (e) {
            return reply.code(401).send("https://http.cat/401");
        }
    };
}