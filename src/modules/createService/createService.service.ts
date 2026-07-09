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

const updateUserStatus = async (isActive: boolean, id: string) => {

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if(!user){
    throw new Error("User not found")
  }

  if(isActive === user.isActive){
    throw new Error("You have allready updated data")
  }

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
  });

  return updatedUser;
};

export const CategoryCreate = {
  createdCategory,
  updateUserStatus,
};
