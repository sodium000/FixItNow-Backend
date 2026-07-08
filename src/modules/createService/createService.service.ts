
import { prisma } from "../../lib/prisma";

interface Data {
    name: string;
    description?: string;
}

const createdCategory = async (payload: Data) => {
    const { name, description } = payload;

    const category = await prisma.category.create({
        data: {
            name,
            description,
        },
    });

    return category;
};

export const CategoryCreate = {
    createdCategory,
};