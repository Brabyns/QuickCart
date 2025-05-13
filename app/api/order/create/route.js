import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { accessedDynamicData } from "next/dist/server/app-render/dynamic-rendering";
import { NextResponse } from "next/server";
import { inngest } from "@/config/inngest";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid Data" });
    }

    //Calculate amount using Items
    // const amount = await items.reduce(async(acc, item) => {
    //     const product = await Product.findById(item.product);
    //     return acc + product.offerPrice * item.quantity
    // },0)

    const productPrices = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return product.offerPrice * item.quantity;
      })
    );

    const amount = productPrices.reduce((acc, val) => acc + val, 0);

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items,
        amount: amount + Math.ceil(amount * 0.02),
        date: Date(),
      },
    });

    //Clear Users Cart
    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
