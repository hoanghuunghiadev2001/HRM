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
    const isGrab = proposal.proposalType === "VEHICLE_GRAB";
    const titleText = isGrab
      ? "Yêu cầu đặt xe dịch vụ (Grab/Taxi)"
      : "Yêu cầu điều xe nội bộ";
    const statusColor = isGrab ? "#f59f00" : "#7950f2"; // Màu thương hiệu Grab (vàng) hoặc Tím nội bộ

    const emailData = {
      to: [employee.contactInfo?.email],
      subject: `[${titleText}] ${proposal.title}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f7f6; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
            
            <div style="background-color: ${statusColor}; padding: 25px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">${titleText}</h1>
            </div>

            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Chào <strong>${employee.name}</strong>,</p>
              <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">Bạn có một yêu cầu mới cần phê duyệt. Vui lòng kiểm tra chi tiết bên dưới:</p>

              <div style="background: #fcfcfc; border: 1px solid #eee; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📋 Thông tin chi tiết</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #444;">
                  ${this.renderRow("Tiêu đề", proposal.title)}
                  ${this.renderRow("Người đề xuất", proposal.proposer?.name || "---")}
                  ${this.renderRow("Lộ trình", `<strong>${proposal.pickupPlace || "---"}</strong> ➔ <strong>${proposal.dropoffPlace || "---"}</strong>`)}
                   ${this.renderRow("Số KM", proposal.vehicleKm || "---")}
                   ${this.renderRow("Số Tiền", proposal.vehicleAmount || "---")}
                   ${this.renderRow("Số RO", proposal.roNumber || "---")}

                  ${
                    isGrab
                      ? `${this.renderRow("Khách hàng", proposal.customerName || "---")} ${this.renderRow("Mã RO", proposal.roNumber || "---")}`
                      : `${this.renderRow("Phương tiện", proposal.vehicle?.name || "<em>Đang chờ điều phối</em>")}`
                  }
                </table>
              </div>

              <div style="text-align: center; margin-top: 35px;">
                <a href="${proposal.approveLink}" style="background-color: #2b8a3e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px; display: inline-block;">Phê duyệt</a>
                <a href="${proposal.rejectLink}" style="background-color: #c92a2a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Từ chối</a>
              </div>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <a href="${process.env.detailUrlRequest}/proposal/my-proposals/${proposal.id}" style="color: #666; font-size: 13px; text-decoration: underline;">Xem chi tiết yêu cầu</a>
              <p style="font-size: 11px; color: #aaa; margin-top: 10px;">© ${new Date().getFullYear()} Toyota Bình Dương. Đây là email tự động từ hệ thống HRM.</p>
            </div>
          </div>
        </div>
      `,
    };
    return sendEmail(emailData);
  }

  // Helper function để tạo dòng bảng đẹp hơn
  private static renderRow(label: string, value: string) {
    return `<tr>
      <td style="padding: 6px 0; color: #888; width: 120px; vertical-align: top;">${label}:</td>
      <td style="padding: 6px 0; color: #333; font-weight: 500;">${value}</td>
    </tr>`;
  }
}
