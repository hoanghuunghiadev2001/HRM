/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendEmail } from "./mail";

export class EmailService {
  static async sendSignatureRequest(employee: any, proposal: any) {
    const fileLink = proposal.fileUrl
      ? `<p style="margin-top: 15px; font-size: 14px;"><a href="${proposal.fileUrl}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;"><span style="vertical-align: middle; margin-right: 5px;">📎</span> Tải file đề xuất</a></p>`
      : "";
    console.log(
      `[EmailService] Sending signature request to ${
        employee.contactInfo?.email || employee.employeeCode
      }@company.com for proposal ${
        proposal.title
      }. File link: ${fileLink.substring(0, 100)}...`,
    );
    const emailData = {
      to: [
        employee.contactInfo?.email || `${employee.employeeCode}@company.com`,
      ],
      subject: `Yêu cầu đồng ý đề xuất: ${proposal.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="color: #333333; margin: 0; font-size: 24px;">Hệ thống HRM</h1>
          </div>

          <div style="padding: 20px 0;">
            <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 0; font-size: 20px;">
              Yêu cầu đồng ý đề xuất
            </h2>
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${
              employee.name
            }</strong>,</p>
            <p style="font-size: 16px; color: #333;">
              Bạn được yêu cầu đồng ý cho đề xuất: <strong style="color: #007bff;">${
                proposal.title
              }</strong>
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e9ecef;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Mô tả:</strong> ${
                proposal.description || "Không có mô tả"
              }</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Người đề xuất:</strong> ${
                proposal.proposer.name
              }</p>
              <p style="margin: 0; font-size: 14px; color: #555;"><strong>Ngày tạo:</strong> ${new Date(
                proposal.createdAt,
              ).toLocaleDateString("vi-VN")}</p>
            </div>
            
            ${fileLink}
            
            <p style="font-size: 16px; color: #333; margin-top: 20px;">Vui lòng truy cập hệ thống để xem chi tiết và đưa ra quyết định.</p>
<div style="text-align:center; margin:30px 0;">
  <a href="${proposal.approveLink}" 
     style="
        background: linear-gradient(90deg,#28a745,#1e7e34);
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        display: inline-block;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-right:12px;
        transition: all 0.2s ease-in-out;
     "
     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)';"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
    ✅ Đồng ý
  </a>
  <a href="${proposal.rejectLink}" 
     style="
        background: linear-gradient(90deg,#dc3545,#a71d2a);
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        display: inline-block;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.2s ease-in-out;
     "
     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)';"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
    ❌ Từ chối
  </a>
</div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${
                proposal.id
              }" 
                style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Xem đề xuất
              </a>
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
            <p style="font-size: 12px; color: #888888; margin: 0;">
              Email này được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
            </p>
            <p style="font-size: 12px; color: #888888; margin: 5px 0 0;">
              © ${new Date().getFullYear()} Công ty cổ phần Toyota Bình Dương. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
    return sendEmail(emailData);
  }

  static async sendApprovalRequest(employee: any, proposal: any) {
    const fileLink = proposal.fileUrl
      ? `<p style="margin-top: 15px; font-size: 14px;"><a href="${proposal.fileUrl}" target="_blank" style="color: #28a745; text-decoration: none; font-weight: bold;"><span style="vertical-align: middle; margin-right: 5px;">📎</span> Tải file đề xuất</a></p>`
      : "";
    const emailData = {
      to: [
        employee.contactInfo?.email || `${employee.employeeCode}@company.com`,
      ],
      subject: `Yêu cầu phê duyệt đề xuất: ${proposal.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="color: #333333; margin: 0; font-size: 24px;">Hệ thống HRM</h1>
          </div>

          <div style="padding: 20px 0;">
            <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px; margin-top: 0; font-size: 20px;">
              Yêu cầu phê duyệt đề xuất
            </h2>
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${
              employee.name
            }</strong>,</p>
            <p style="font-size: 16px; color: #333;">
              Đề xuất <strong style="color: #28a745;">${
                proposal.title
              }</strong> đã được tất cả người liên quan đồng ý.
            </p>
            <p style="font-size: 16px; color: #333;">Bây giờ cần sự phê duyệt của bạn.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e9ecef;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Mô tả:</strong> ${
                proposal.description || "Không có mô tả"
              }</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Người đề xuất:</strong> ${
                proposal.proposer.name
              }</p>
              <p style="margin: 0; font-size: 14px; color: #555;"><strong>Ngày tạo:</strong> ${new Date(
                proposal.createdAt,
              ).toLocaleDateString("vi-VN")}</p>
            </div>
            
            ${fileLink}
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #155724; font-size: 15px; font-weight: bold;">
                ✅ Tất cả người đồng ý đã xác nhận. Đang chờ phê duyệt từ bạn.
              </p>
            </div>
           <div style="text-align:center; margin:30px 0;">
  <a href="${proposal.approveLink}" 
     style="
        background: linear-gradient(90deg,#28a745,#1e7e34);
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        display: inline-block;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-right:12px;
        transition: all 0.2s ease-in-out;
     "
     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)';"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
    ✅ Duyệt
  </a>
  <a href="${proposal.rejectLink}" 
     style="
        background: linear-gradient(90deg,#dc3545,#a71d2a);
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        display: inline-block;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.2s ease-in-out;
     "
     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)';"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
    ❌ Từ chối
  </a>
</div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${
                proposal.id
              }" 
                style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
               Xem chi tiết 
              </a>
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
            <p style="font-size: 12px; color: #888888; margin: 0;">
              Email này được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
            </p>
            <p style="font-size: 12px; color: #888888; margin: 5px 0 0;">
              © ${new Date().getFullYear()} Công ty cổ phần Toyota Bình Dương. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
    return sendEmail(emailData);
  }

  static async sendStatusUpdate(
    employee: any,
    proposal: any,
    status: string,
    reason?: string,
  ) {
    const statusConfig = {
      approved: {
        text: "đã được phê duyệt",
        color: "#28a745",
        icon: "✅",
        bgColor: "#d4edda",
        borderColor: "#c3e6cb",
      },
      rejected: {
        text: "đã bị từ chối",
        color: "#dc3545",
        icon: "❌",
        bgColor: "#f8d7da",
        borderColor: "#f5c6cb",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.approved;

    console.log(
      `[EmailService] Sending status update to ${
        employee.contactInfo?.email || employee.employeeCode
      }@company.com for proposal ${proposal.title}. Status: ${status}`,
    );

    const emailData = {
      to: [
        employee.contactInfo?.email || `${employee.employeeCode}@company.com`,
      ],
      subject: `Cập nhật trạng thái đề xuất: ${proposal.title}`,
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
          <h1 style="color: #333333; margin: 0; font-size: 24px;">Hệ thống HRM</h1>
        </div>

        <div style="padding: 20px 0;">
          <h2 style="color: #333; border-bottom: 2px solid ${
            config.color
          }; padding-bottom: 10px; margin-top: 0; font-size: 20px;">
            Cập nhật trạng thái đề xuất
          </h2>
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${
            employee.name
          }</strong>,</p>
          
          <div style="background: ${config.bgColor}; border: 1px solid ${
            config.borderColor
          }; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: ${
              config.color
            }; font-size: 16px; font-weight: bold;">
              ${config.icon} Đề xuất <strong>${proposal.title}</strong> ${
                config.text
              }.
            </p>
            ${
              status === "rejected" && reason
                ? `<p style="margin: 8px 0 0; color: ${config.color}; font-size: 14px;">
                     <strong>Lý do từ chối:</strong> ${reason}
                   </p>`
                : ""
            }
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e9ecef;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Mô tả:</strong> ${
              proposal.description || "Không có mô tả"
            }</p>
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Người đề xuất:</strong> ${
              proposal.proposer.name
            }</p>
            <p style="margin: 0; font-size: 14px; color: #555;"><strong>Ngày cập nhật:</strong> ${new Date().toLocaleDateString(
              "vi-VN",
            )}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${
              proposal.id
            }" 
              style="background: ${
                config.color
              }; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Xem chi tiết
            </a>
          </div>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
          <p style="font-size: 12px; color: #888888; margin: 0;">
            Email này được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
          </p>
          <p style="font-size: 12px; color: #888888; margin: 5px 0 0;">
            © ${new Date().getFullYear()} Công ty cổ phần Toyota Bình Dương. All rights reserved.
          </p>
        </div>
      </div>
    `,
    };

    return sendEmail(emailData);
  }

  static async sendProposalCreatedConfirmation(employee: any, proposal: any) {
    const fileLink = proposal.fileUrl
      ? `<p style="margin-top: 15px; font-size: 14px;"><a href="${proposal.fileUrl}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;"><span style="vertical-align: middle; margin-right: 5px;">📎</span> File đề xuất đã upload</a></p>`
      : "";
    console.log(
      `[EmailService] Sending proposal created confirmation to ${
        employee.contactInfo?.email || employee.employeeCode
      }@company.com for proposal ${
        proposal.title
      }. File link: ${fileLink.substring(0, 100)}...`,
    );
    const emailData = {
      to: [
        employee.contactInfo?.email || `${employee.employeeCode}@company.com`,
      ],
      subject: `Đề xuất đã được tạo thành công: ${proposal.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="color: #333333; margin: 0; font-size: 24px;">Hệ thống HRM</h1>
          </div>

          <div style="padding: 20px 0;">
            <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 0; font-size: 20px;">
              Đề xuất đã được tạo thành công
            </h2>
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${
              employee.name
            }</strong>,</p>
            <p style="font-size: 16px; color: #333;">
              Đề xuất <strong style="color: #007bff;">${
                proposal.title
              }</strong> của bạn đã được tạo thành công.
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e9ecef;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Tên đề xuất:</strong> ${
                proposal.name
              }</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Tiêu đề:</strong> ${
                proposal.title
              }</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Mô tả:</strong> ${
                proposal.description || "Không có mô tả"
              }</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #555;"><strong>Ngày tạo:</strong> ${new Date(
                proposal.createdAt,
              ).toLocaleDateString("vi-VN")}</p>
              <p style="margin: 0; font-size: 14px; color: #555;"><strong>Trạng thái:</strong> Đang chờ đồng ý</p>
            </div>
            
            ${fileLink}
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460; font-size: 15px; font-weight: bold;">
                📧 Email đã được gửi đến tất cả người cần đồng ý. Bạn sẽ nhận được thông báo khi có cập nhật.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${
                proposal.id
              }" 
                style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Theo dõi đề xuất
              </a>
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
            <p style="font-size: 12px; color: #888888; margin: 0;">
              Email này được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
            </p>
            <p style="font-size: 12px; color: #888888; margin: 5px 0 0;">
              © ${new Date().getFullYear()} Công ty cổ phần Toyota Bình Dương. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
    return sendEmail(emailData);
  }

  static async sendSignatureUpdateNotification(
    proposer: any,
    proposal: any,
    signer: any,
    action: string,
  ) {
    const actionConfig = {
      approved: { text: "đã đồng ý", color: "#28a745", icon: "✅" },
      rejected: { text: "đã từ chối", color: "#dc3545", icon: "❌" },
    };
    const config =
      actionConfig[action as keyof typeof actionConfig] ||
      actionConfig.approved;
    console.log(
      `[EmailService] Sending signature update notification to ${
        proposer.contactInfo?.email || proposer.employeeCode
      }@company.com for proposal ${proposal.title}. Signer: ${
        signer.name
      }, Action: ${action}`,
    );
    const emailData = {
      to: [
        proposer.contactInfo?.email || `${proposer.employeeCode}@company.com`,
      ],
      subject: `Cập nhật đề xuất: ${signer.name} ${config.text}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="color: #333333; margin: 0; font-size: 24px;">Hệ thống HRM</h1>
          </div>

          <div style="padding: 20px 0;">
            <h2 style="color: #333; border-bottom: 2px solid ${
              config.color
            }; padding-bottom: 10px; margin-top: 0; font-size: 20px;">
              Cập nhật đề xuất
            </h2>
            <p style="font-size: 16px; color: #333;">Xin chào <strong>${
              proposer.name
            }</strong>,</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e9ecef;">
              <p style="margin: 0; color: ${
                config.color
              }; font-size: 15px; font-weight: bold;">
                ${config.icon} <strong>${signer.name}</strong> ${
                  config.text
                } đề xuất <strong>${proposal.title}</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${
                proposal.id
              }" 
                style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Xem chi tiết đề xuất
              </a>
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
            <p style="font-size: 12px; color: #888888; margin: 0;">
              Email này được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
            </p>
            <p style="font-size: 12px; color: #888888; margin: 5px 0 0;">
              © ${new Date().getFullYear()} Công ty cổ phần Toyota Bình Dương. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
    return sendEmail(emailData);
  }

  static async sendProposalRejectedBySigner(
    proposer: any,
    proposal: any,
    signer: any,
    reason: string,
  ) {
    const fileLink = proposal.fileUrl
      ? `<p style="margin-top: 15px; font-size: 14px;"><a href="${proposal.fileUrl}" target="_blank" style="color: #dc3545; text-decoration: none; font-weight: bold;"><span style="vertical-align: middle; margin-right: 5px;">📎</span> Xem file đính kèm</a></p>`
      : "";

    const emailData = {
      to: [
        proposer.contactInfo?.email || `${proposer.employeeCode}@company.com`,
      ],
      subject: `❌ Đề xuất "${proposal.title}" bị từ chối.`,
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
          <h1 style="color: #333333; margin: 0; font-size: 24px;">Hệ thống HRM</h1>
        </div>

        <div style="padding: 20px 0;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px; margin-top: 0; font-size: 20px;">
            Đề xuất bị từ chối
          </h2>
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${
            proposer.name
          }</strong>,</p>
          <p style="font-size: 16px; color: #333;">
            Đề xuất <strong style="color: #dc3545;">"${
              proposal.title
            }"</strong> của bạn đã bị từ chối.
          </p>
          
          <div style="background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; font-weight: bold;">
              ❌ <strong>Trạng thái:</strong> Đề xuất đã bị từ chối và không tiếp tục được phê duyệt.
            </p>
            ${
              reason
                ? `<p style="margin: 8px 0 0; font-size: 14px;"><strong>Lý do từ chối:</strong> ${reason}</p>`
                : ""
            }
          </div>
          
          ${
            proposal.description
              ? `<p style="font-size: 14px; color: #333; margin-top: 20px;"><strong>Mô tả đề xuất:</strong><br>
                 <span style="color: #555;">${proposal.description}</span></p>`
              : ""
          }
          
          ${fileLink}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${
              proposal.id
            }" 
              style="background-color: #dc3545; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">
              🔍 Xem chi tiết đề xuất
            </a>
          </div>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px;">
          <p style="font-size: 12px; color: #888888; margin: 0;">
            Email này được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
          </p>
          <p style="font-size: 12px; color: #888888; margin: 5px 0 0;">
            © ${new Date().getFullYear()} Công ty cổ phần Toyota Bình Dương. All rights reserved.
          </p>
        </div>
      </div>
    `,
    };

    return sendEmail(emailData);
  }

  static async sendVehicleRequest(employee: any, proposal: any) {
    const isInternal = proposal.proposalType === "VEHICLE";
    const isGrabCustomer =
      proposal.proposalType === "VEHICLE_GRAB" &&
      proposal.grabSubType === "CUSTOMER";
    const isGrabPersonal =
      proposal.proposalType === "VEHICLE_GRAB" &&
      proposal.grabSubType === "PERSONAL";

    // ── Cấu hình header theo loại ──────────────────────────────────────────────
    const config = isInternal
      ? {
          color: "#7950f2",
          icon: "🚗",
          title: "Điều xe nội bộ",
          subjectPrefix: "Điều xe nội bộ",
        }
      : isGrabCustomer
        ? {
            color: "#f59f00",
            icon: "🛺",
            title: "Đặt xe GSM — Khách hàng",
            subjectPrefix: `GSM Khách hàng${proposal.isException ? " – Ngoại lệ" : ""}`,
          }
        : {
            color: "#1971c2",
            icon: "🚕",
            title: "Đặt xe GSM — Cá nhân",
            subjectPrefix: "GSM Cá nhân",
          };

    // ── Helper: 1 hàng trong bảng ──────────────────────────────────────────────
    const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:#888;font-size:13px;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#222;font-size:13px;font-weight:500;">${value}</td>
    </tr>`;

    // ── Helper: khối info-card ─────────────────────────────────────────────────
    const card = (title: string, rows: string) => `
    <div style="background:#fcfcfc;border:1px solid #eee;border-left:4px solid ${config.color};
                border-radius:6px;padding:18px 20px;margin-bottom:16px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#777;
                text-transform:uppercase;letter-spacing:.5px;">${title}</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`;

    // ── Helper: format tiền VND ────────────────────────────────────────────────
    const vnd = (v: any) =>
      v
        ? new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(Number(v))
        : "---";

    const route = `
    <span style="color:${config.color};font-weight:600;">${proposal.pickupPlace || "---"}</span>
    &nbsp;→&nbsp;
    <span style="color:${config.color};font-weight:600;">${proposal.dropoffPlace || "---"}</span>`;

    // ── Nội dung bảng theo từng loại ───────────────────────────────────────────
    const roPercent =
      proposal.roAmount &&
      proposal.vehicleAmount &&
      Number(proposal.roAmount) > 0
        ? (Number(proposal.vehicleAmount) / Number(proposal.roAmount)) * 100
        : null;

    const tableContent = isInternal
      ? card(
          "Thông tin chuyến xe",
          row("Người đề xuất", proposal.proposer?.name || "---") +
            row("Lộ trình", route) +
            row(
              "Phương tiện",
              proposal.vehicle?.name ||
                "<em style='color:#aaa'>Đang chờ điều phối</em>",
            ) +
            row(
              "Thời gian đi",
              proposal.startAt
                ? new Date(proposal.startAt).toLocaleString("vi-VN")
                : "---",
            ) +
            row(
              "Thời gian về",
              proposal.endAt
                ? new Date(proposal.endAt).toLocaleString("vi-VN")
                : "---",
            ),
        )
      : isGrabCustomer
        ? card(
            "Thông tin khách hàng & RO",
            row("Người đề xuất", proposal.proposer?.name || "---") +
              row("Khách hàng", proposal.customerName || "---") +
              row("Số RO", proposal.roNumber || "---"),
          ) +
          card(
            "Thông tin chuyến đi",
            row("Lộ trình", route) +
              row(
                "Số KM ước tính",
                proposal.vehicleKm ? `${proposal.vehicleKm} km` : "---",
              ) +
              row("Tiền xe ước tính", vnd(proposal.vehicleAmount)),
          ) +
          card(
            "Tài chính",
            row("Giá trị RO", vnd(proposal.roAmount)) +
              row(
                "Tỷ lệ tiền xe / RO",
                roPercent !== null
                  ? `<span style="color:${roPercent > 5 ? "#c92a2a" : "#2b8a3e"};font-weight:600;">
                 ${roPercent.toFixed(2)}%${roPercent > 5 ? " ⚠ Ngoại lệ" : ""}
               </span>`
                  : "---",
              ),
          )
        : /* isGrabPersonal */
          card(
            "Thông tin chuyến đi",
            row("Người đề xuất", proposal.proposer?.name || "---") +
              row("Lộ trình", route) +
              row(
                "Số KM ước tính",
                proposal.vehicleKm ? `${proposal.vehicleKm} km` : "---",
              ) +
              row("Tiền ước tính", vnd(proposal.vehicleAmount)),
          );

    // ── Banner ngoại lệ (chỉ GSM khách hàng) ──────────────────────────────────
    const exceptionBanner =
      isGrabCustomer && proposal.isException
        ? `<div style="background:#fff3cd;border:1px solid #ffd43b;border-radius:6px;
                     padding:12px 16px;margin-bottom:16px;">
           <p style="margin:0;font-size:13px;color:#856404;line-height:1.6;">
             ⚠ <strong>Trường hợp ngoại lệ</strong> — Chi phí xe vượt ngưỡng 5% giá trị RO.
             Yêu cầu thêm bước phê duyệt cấp cao.
           </p>
         </div>`
        : "";

    // ── Ghi chú (chỉ xe nội bộ & GSM cá nhân) ────────────────────────────────
    const noteBg = isInternal ? "#f5f3ff" : "#e7f5ff";
    const noteColor = isInternal ? "#5f4dd0" : "#1864ab";
    const noteBlock =
      !isGrabCustomer && proposal.description
        ? `<div style="background:${noteBg};border-radius:6px;padding:14px 18px;margin-bottom:16px;">
           <p style="margin:0;font-size:13px;color:${noteColor};line-height:1.6;">
             <strong>Ghi chú:</strong> ${proposal.description}
           </p>
         </div>`
        : "";

    // ── HTML cuối ──────────────────────────────────────────────────────────────
    const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
                max-width:600px;margin:0 auto;background:#f0f2f5;padding:24px;">
      <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);">

        <!-- Header -->
        <div style="background:${config.color};padding:28px 30px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,.15);border-radius:50%;
                      width:52px;height:52px;line-height:52px;text-align:center;
                      font-size:26px;margin-bottom:12px;">${config.icon}</div>
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">${config.title}</h1>
          <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:13px;">${proposal.title}</p>
        </div>

        <!-- Body -->
        <div style="padding:30px 32px;">
          <p style="font-size:15px;color:#333;margin:0 0 6px;">
            Chào <strong>${employee.name}</strong>,
          </p>
          <p style="color:#666;line-height:1.65;margin:0 0 24px;font-size:14px;">
            Có một yêu cầu mới đang chờ bạn phê duyệt.
          </p>

          ${tableContent}
          ${exceptionBanner}
          ${noteBlock}

          <!-- Nút hành động -->
          <div style="text-align:center;margin-top:32px;">
            <a href="${proposal.approveLink}"
               style="background:#2b8a3e;color:#fff;padding:12px 28px;text-decoration:none;
                      border-radius:7px;font-weight:600;font-size:14px;margin-right:10px;display:inline-block;">
              ✓ Phê duyệt
            </a>
            <a href="${proposal.rejectLink}"
               style="background:#c92a2a;color:#fff;padding:12px 28px;text-decoration:none;
                      border-radius:7px;font-weight:600;font-size:14px;display:inline-block;">
              ✗ Từ chối
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8f9fa;padding:18px 30px;text-align:center;border-top:1px solid #eee;">
          <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${proposal.id}"
             style="color:#555;font-size:13px;text-decoration:underline;">
            Xem chi tiết yêu cầu
          </a>
          <p style="font-size:11px;color:#bbb;margin:10px 0 0;">
            © ${new Date().getFullYear()} Toyota Bình Dương &nbsp;·&nbsp; Email tự động từ hệ thống HRM
          </p>
        </div>

      </div>
    </div>`;

    return sendEmail({
      to: [employee.contactInfo?.email],
      subject: `[${config.subjectPrefix}] ${proposal.title}`,
      html,
    });
  }

  // Helper function để tạo dòng bảng đẹp hơn
  private static renderRow(label: string, value: string) {
    return `<tr>
      <td style="padding: 6px 0; color: #888; width: 120px; vertical-align: top;">${label}:</td>
      <td style="padding: 6px 0; color: #333; font-weight: 500;">${value}</td>
    </tr>`;
  }
}
