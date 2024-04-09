import Income from "../models/incomeModel";
import User from "../models/userModel";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { IncomeIn } from "../interface/incomeInterface";

export const addIncome = async (req: Request, res: Response) => {
  const { title, amount, category, description, date } = req.body;

  const auth = req.headers.authorization;
  if (!auth) {
    throw new Error("not authorized");
  }
  const token = auth.split(" ")[1];
  const decodedtoken = jwt.decode(token) as JwtPayload;
  if (!decodedtoken) {
    throw new Error("token not found");
  }
  const userId = decodedtoken.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("user not found");
  }
  if (user.isEarning === false) {
    return res.status(403).json({
      status: "failed",
      messege: "You are not Earning so you can not add any income",
    });
  }

  const income = await Income.create({
    title,
    amount,
    category,
    description,
    date,
    addedBy: user.name,
    familycode: user.familycode,
  });
  console.log(income);

  try {
    if (!title || !category || !description || !date) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    if (amount <= 0 || amount === "number") {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number!" });
    }

    res.status(200).json({
      status: "success",
      message: "Income Added",
      income,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const getIncomes = async (req: Request, res: Response) => {
  try {
    let totalincome = 0;

    const auth = req.headers.authorization;
    if (!auth) {
      throw new Error("not authorized");
    }
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = auth.split(" ")[1];

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || "defaultSecret$Yash@123$"
      ) as JwtPayload;
      const userId = decodedToken.id;

      let monthlyincome: Array<IncomeIn> = [];
      const admin = await User.findOne({ _id: userId });
      if (!admin) {
        throw new Error("user not found");
      }
      const familyCode = admin.familycode;
      let incomes = await Income.find({
        familycode: familyCode,
      }).sort({
        createdAt: -1,
      });

      const currentMonth = new Date().getMonth() + 1;
      for (let income of incomes) {
        let incMonth = income.date.getMonth() + 1;
        if (incMonth === currentMonth) {
          monthlyincome.push(income);
        }
      }
      for (let i = 0; i < monthlyincome.length; i++) {
        totalincome = totalincome + monthlyincome[i].amount[0];
      }

      return res.status(200).json({
        status: "success",
        incomes,
        monthlyincome,
        totalincome,
      });
    } catch (error: any) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteIncome = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("this router is calling");
    const auth = req.headers.authorization;
    if (!auth) {
      throw new Error("not authorized");
    }
    const token = auth.split(" ")[1];
    const decodedtoken = jwt.decode(token) as JwtPayload; // Expl;
    if (!decodedtoken) {
      throw new Error("token not found");
    }
    const userId = decodedtoken.id;
    console.log(userId);

    // Find user and expense based on their IDs
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("user not found");
    }

    const income = await Income.findById(req.params.incomeId);
    if (!income) {
      throw new Error("income not found with that id");
    }
    console.log(income.addedBy);

    // Check if the user is the one who added the expense
    if (user.name !== income.addedBy) {
      return res.status(403).json({
        status: "failed",
        message: `This income is added by ${income.addedBy}. You are not allowed to delete it`,
      });
    }
    await Income.deleteOne({ _id: req.params.incomeId });

    res.status(200).json({ status: "success", message: "Income Deleted" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }

  next();
};