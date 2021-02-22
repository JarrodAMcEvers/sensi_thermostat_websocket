export const socket_endpoint = 'https://rt.sensiapi.io';
export const token_endpoint  = 'https://oauth.sensiapi.io';
export const client_id       = process.env.CLIENT_ID;
export const client_secret   = process.env.CLIENT_SECRET;
export const email           = process.env.EMAIL;
export const password        = process.env.PASSWORD;
export const protection_mode: boolean = process.env.PROTECTION_MODE == 'true'

export const lowest_allowable_tempeature: number  = Number(process.env.LOWEST_ALLOWABLE_TEMPERATURE);
export const highest_allowable_tempeature: number = Number(process.env.HIGHEST_ALLOWABLE_TEMPERATURE);
export const reset_values = {
    heat: process.env.HEAT_RESET_VALUE,
    cool: process.env.COOL_RESET_VALUE
}