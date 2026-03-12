export const APP_NAME = "CTSE Microservice System";

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const ROLES = {
    ADMIN: "ADMIN",
    USER: "USER",
    DELIVERY: "DELIVERY",
};

export const ORDER_STATUS = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    DELIVERED: "DELIVERED",
};

export const PRODUCT_STATUS = {
    AVAILABLE: "AVAILABLE",
    RESERVED: "RESERVED",
};