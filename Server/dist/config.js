"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPRESS_PORT = exports.WSS_PORT = void 0;
exports.WSS_PORT = process.env.WSS_PORT ? +process.env.WSS_PORT : 3001;
exports.EXPRESS_PORT = process.env.EXPRESS_PORT ? +process.env.EXPRESS_PORT : 3002;
