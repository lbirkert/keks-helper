import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import { CACHE_PATH } from "../main.js";
import {hash} from "./hash.js";
import https from "https";
import fs from "fs";
import _path from "path";

export type Response = {
    status: number | undefined,
    data: Buffer,
    headers: OutgoingHttpHeaders
};

export type JResponse = Response & {
    data: any
};

export type URLResolvable = URL | string | {
    hostname: string,
    path: string,
    protocol: string,
    port: string
};

export type Method = "GET" | "POST" | "PUT" | "HEAD" | "DELETE";

export type Request = {
    url: URLResolvable,
    method?: Method,
    headers?: IncomingHttpHeaders,
    data?: any
};

export function isURLResolvable(obj: any): boolean {
    return typeof obj === "string" || obj instanceof URL 
        || (obj.hostname && obj.path && obj.protocol && obj.port);
}

export async function makeRequestJ(request: Request | URLResolvable, cache: boolean = false): Promise<JResponse> {
    const response = await makeRequest(request, cache);

    return {...response, data: JSON.parse(response.data.toString()) };
}

export function makeRequest(request: Request | URLResolvable, cache: boolean = false): Promise<Response> {
    if(isURLResolvable(request)) {
        var data: any = null;
        var url: URLResolvable = request as URLResolvable;
        var headers: IncomingHttpHeaders = {};
        var method: Method = "GET";
        
    } else {
        var _request = request as Request;
        var {data, url} = _request;
        var headers = _request.headers || {};
        var method = _request.method || "GET";
    }

    if(typeof url === "string" || url instanceof URL) {
        const _url = new URL(url);
        var {hostname, protocol, port} = _url;
        var path = _url.pathname + _url.search;
    } else var {hostname, path, protocol, port} = url;

    return new Promise(async (resolve, reject) => {
        if(cache) {
            const req_str = method + path + hostname + port;
            const hex_hash = Number(hash(req_str)).toString(16);
            var cache_path = _path.join(CACHE_PATH, hex_hash);
            
            if(await new Promise(r=>fs.access(cache_path, (err) => r(!err)))) {
                fs.readFile(cache_path, (err, data)=>{
                    if(err) reject(err);
                    else resolve({
                        status: 200,
                        headers: {},
                        data
                    });
                })

                return;
            }
        }
        
        const req = https.request(
                {
                        hostname,
                        port,
                        method,
                        protocol,
                        path,
                        headers
                },
                (res) => {
                        const chunks: Buffer[] = [];

                        res.on("data", (d) => {
                                if (d instanceof Buffer) chunks.push(d);
                        });

                        res.on("end", () => {
                            const buffer = Buffer.concat(chunks);

                            if(cache && res.statusCode == 200) fs.writeFile(cache_path, buffer, (err) => {
                                if(err) reject(err);
                                else resolve({
                                    status: res.statusCode,
                                    data: buffer,
                                    headers: res.headers
                                });
                            });
                            else resolve({
                                status: res.statusCode,
                                data: buffer,
                                headers: res.headers
                            });
                        });
                }
        );

        req.on("error", (error) => {
                reject(error);
        });

        if (data) req.write(data);
        req.end();
});
}