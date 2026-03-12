export const formatCurrency = (amount) => {
    if (!amount) return "$0";
    return `$${Number(amount).toFixed(2)}`;
};

export const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
};

export const truncateText = (text, length = 100) => {
    if (!text) return "";
    return text.length > length
        ? text.substring(0, length) + "..."
        : text;
};

export const getStatusColor = (status) => {
    switch (status) {
        case "DELIVERED":
            return "green";
        case "PROCESSING":
            return "orange";
        case "PENDING":
            return "gray";
        default:
            return "blue";
    }
};