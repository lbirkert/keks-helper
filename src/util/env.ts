export function requireEnv(name: string): string {
	const v = process.env[name];
	if (v) return v;
	else throw `Required Environment variable '${name}' was not declared!`;
}

export function requireEnvI(name: string): number {
	const v = requireEnv(name);
	try {
		return parseInt(v);
	} catch (e) {
		throw `Environment variable '${name}' must be a number! (found: '${v}')`;
	}
}
