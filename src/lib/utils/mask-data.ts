export const maskEmail = (email: string) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, 2)}***@${domain}`;
};

export const maskPhone = (phone: string) => {
    if (!phone || phone.length < 10) return phone;
    return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
};

export const maskName = (name: string) => {
    if (!name || name.length <= 1) return name;
    return `${name[0]}***`;
};

export const maskAddress = (address: string) => {
    if (!address) return "";
    if (address.includes("[Відділення]") || address.includes("[Поштомат]")) {
        const parts = address.split("]");
        return `${parts[0]}] ***`;
    }
    return "***";
};