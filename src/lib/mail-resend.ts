import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "HRM <it@toyotabinhduong.com.vn>", // Thay bằng email domain của bạn sau khi verify
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Mail Exception:", err);
    return { success: false, error: err };
  }
};
