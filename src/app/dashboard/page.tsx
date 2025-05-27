/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import {
  Form,
  type GetProp,
  Input,
  message,
  Modal,
  Upload,
  type UploadProps,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Send } from "lucide-react";
import { ProfileInfo } from "@/components/api";
import { formatCurrency } from "@/components/function";
import ModalLoading from "@/components/modalLoading";
import Image from "next/image";
import InfoPersonal from "@/components/infoPersonal";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [dataProfile, setDataProfile] = useState<ProfileInfo>();
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();

  // Optimized fetch functions using Promise.all
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Thực hiện nhiều API calls song song
      const [profileResponse] = await Promise.all([
        fetch("/api/profile/profile"), // Assuming this returns a Promise
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setDataProfile(profileData);
      }

      // Handle user response if needed
      console.log("User data fetched concurrently");
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Fetch only profile if you don't need concurrent user fetch
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/profile");
      if (res.ok) {
        const data = await res.json();
        setDataProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error("Có lỗi xảy ra khi tải hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use the optimized fetch function
    fetchAllData();
  }, []);

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  useEffect(() => {
    if (dataProfile) {
      // Set giá trị ban đầu cho form
      form.setFieldsValue({
        phoneNumber: dataProfile.contactInfo.phoneNumber,
        relativePhone: dataProfile.contactInfo.relativePhone,
        companyPhone: dataProfile.contactInfo.companyPhone,
        email: dataProfile.contactInfo.email,
      });

      setImageUrl(dataProfile.avatar);
    }
  }, [dataProfile, form]);

  // Optimized update function using Promise.all for validation and update
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);

      // Thực hiện validation và chuẩn bị dữ liệu song song
      const [values] = await Promise.all([
        form.validateFields(), // Validate form
        // Có thể thêm các operations khác như validate image, etc.
      ]);

      console.log(values);

      // Thực hiện update và các operations liên quan song song
      await Promise.all([
        updateProfile(
          imageUrl ?? "",
          values.phoneNumber ?? "",
          values.relativePhone ?? "",
          values.companyPhone ?? "",
          values.email ?? ""
        ),
        // Có thể thêm các API calls khác nếu cần
      ]);

      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    avt: string,
    phoneNumber: string,
    relativePhone: string,
    companyPhone: string,
    email: string
  ) => {
    try {
      const req = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar: avt,
          phone: phoneNumber,
          personalPhone: relativePhone,
          companyPhone: companyPhone,
          email: email,
        }),
      });

      if (req.ok) {
        // Thực hiện các operations sau update song song
        await Promise.all([
          fetchProfile(), // Refresh profile data
        ]);

        countDown();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Optimized image processing
  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  // Optimized base64 conversion with Promise
  const getBase64 = (img: FileType): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result as string));
      reader.addEventListener("error", reject);
      reader.readAsDataURL(img);
    });
  };

  const handleChange: UploadProps["onChange"] = async (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }

    if (info.file.status === "done") {
      try {
        // Sử dụng Promise-based getBase64
        const url = await getBase64(info.file.originFileObj as FileType);
        setImageUrl(url);
      } catch (error) {
        console.error("Error converting image:", error);
        message.error("Có lỗi xảy ra khi xử lý ảnh");
      } finally {
        setLoading(false);
      }
    }
  };

  const countDown = () => {
    let secondsToGo = 3;

    const instance = modal.success({
      title: "Cập nhật thành công",
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <ModalLoading isOpen={loading} />
      {contextHolder}
      <div className="w-full">
        <p className="font-bold text-2xl text-[#4a4a6a]">Hồ sơ cá nhân:</p>
      </div>
      <div className="mt-3">
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader w-[155px] h-[155px] flex justify-center items-center"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? (
            <Image
              loading="lazy"
              src={imageUrl ? imageUrl : "/storage/avt-default.png"}
              alt="avatar"
              style={{ width: "145px" }}
              className="rounded-[50%] h-[145px] object-cover"
              width={145}
              height={145}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold text-2xl text-[#4a4a6a]">
          1. Thông Tin Cá Nhân:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4 pr-4 gap-4 border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
          <InfoPersonal titleValue="Họ và tên" value={dataProfile?.name} />
          <InfoPersonal
            titleValue="Giới tính"
            value={dataProfile?.gender === "MALE" ? "Nam" : "Nữ"}
          />
          <InfoPersonal titleValue="Ngày sinh" value={dataProfile?.birthDate} />
          <InfoPersonal titleValue="Mã NV" value={dataProfile?.employeeCode} />
          <InfoPersonal
            titleValue="Bộ phận"
            value={dataProfile?.workInfo.department}
          />
          <InfoPersonal
            titleValue="Chức vụ"
            value={dataProfile?.workInfo.position}
          />
          <InfoPersonal
            titleValue="Số CCCD"
            value={dataProfile?.personalInfo.identityNumber}
          />
          <InfoPersonal
            titleValue="Ngày cấp"
            value={dataProfile?.personalInfo.issueDate}
          />
          <InfoPersonal
            titleValue="Nơi cấp"
            value={dataProfile?.personalInfo.issuePlace}
          />
          <InfoPersonal
            titleValue="Số điện thoại"
            value={dataProfile?.contactInfo.phoneNumber}
          />
          <InfoPersonal
            titleValue="Nguyên quán"
            value={dataProfile?.personalInfo.hometown}
          />
          <InfoPersonal
            titleValue="Địa chỉ"
            value={dataProfile?.personalInfo.idAddress}
          />
          <InfoPersonal
            titleValue="Mã số thuế"
            value={dataProfile?.personalInfo.taxCode}
          />
          <InfoPersonal
            titleValue="Số sổ BH"
            value={dataProfile?.personalInfo.insuranceNumber}
          />
          <InfoPersonal
            titleValue="Lương đóng BH"
            value={formatCurrency(
              dataProfile?.personalInfo.insuranceSalary ?? 0
            )}
          />
        </div>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold text-2xl text-[#4a4a6a]">
          2. Thông Tin Liên Hệ:
        </p>
        <Form
          form={form}
          layout="vertical"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full gap-4 border border-[#e6e6e6] shadow-xl !p-4 rounded-xl"
        >
          <Form.Item
            name="phoneNumber"
            label={
              <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
                Số điện thoại
              </p>
            }
          >
            <Input maxLength={14} inputMode="numeric" type="number" />
          </Form.Item>
          <Form.Item
            name="relativePhone"
            label={
              <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
                SĐT người thân
              </p>
            }
          >
            <Input maxLength={14} inputMode="numeric" type="number" />
          </Form.Item>
          <Form.Item
            name="companyPhone"
            label={
              <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
                SĐT công ty
              </p>
            }
            vertical={true}
          >
            <Input maxLength={14} inputMode="numeric" type="number" />
          </Form.Item>
          <Form.Item
            name="email"
            label={
              <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
                Email
              </p>
            }
            rules={[{ type: "email", message: "Email không hợp lệ!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold text-2xl text-[#4a4a6a]">
          3. Thông tin công việc:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4 pr-4 gap-4 border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
          <InfoPersonal
            titleValue="Bộ phận"
            value={dataProfile?.workInfo.department}
          />
          <InfoPersonal
            titleValue="Chức vụ"
            value={dataProfile?.workInfo.position}
          />
          <InfoPersonal
            titleValue="Ngành"
            value={dataProfile?.workInfo.specialization}
          />
          <InfoPersonal
            titleValue="Ngày vào TBD"
            value={dataProfile?.workInfo.joinedTBD}
          />
          <InfoPersonal
            titleValue="Ngày vào TeSCC"
            value={dataProfile?.workInfo.joinedTeSCC}
          />
          <InfoPersonal
            titleValue="Ngày tính thâm niên"
            value={dataProfile?.workInfo.seniorityStart}
          />
          <InfoPersonal
            titleValue="Thâm niên"
            value={dataProfile?.workInfo.seniority}
          />
          <InfoPersonal
            titleValue="Số hợp đồng"
            value={dataProfile?.workInfo.contractNumber}
          />
          <InfoPersonal
            titleValue="Ngày ký HĐ"
            value={dataProfile?.workInfo.contractDate}
          />
          <InfoPersonal
            titleValue="Loại hợp đồng"
            value={dataProfile?.workInfo.contractType}
          />
          <InfoPersonal
            titleValue="Ngày hết hạn HĐ"
            value={dataProfile?.workInfo.contractEndDate}
          />
        </div>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold text-2xl text-[#4a4a6a]">
          4. Chứng chỉ & Trình độ:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4 pr-4 gap-4 border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
          <InfoPersonal
            titleValue="Trình độ học vấn"
            value={dataProfile?.personalInfo.education}
          />
          <InfoPersonal
            titleValue="Bằng lái xe"
            value={dataProfile?.personalInfo.drivingLicense}
          />
          <InfoPersonal
            titleValue="Chứng chỉ Toyota"
            value={dataProfile?.personalInfo.toyotaCertificate}
          />
        </div>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold text-2xl text-[#4a4a6a]">
          5. Thông tin bảo hiểm / Thuế:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4 pr-4 gap-4 border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
          <InfoPersonal
            titleValue="Mã số thuế"
            value={dataProfile?.personalInfo.taxCode}
          />
          <InfoPersonal
            titleValue="Số sổ BHXH"
            value={dataProfile?.personalInfo.insuranceNumber}
          />
          <InfoPersonal
            titleValue="Lương đóng BH"
            value={formatCurrency(
              dataProfile?.personalInfo.insuranceSalary ?? 0
            )}
          />
        </div>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold text-2xl text-[#4a4a6a]">
          6. Trạng thái và thông tin khác:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4 pr-4 gap-4 border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
          <InfoPersonal
            titleValue="Trạng thái làm việc"
            value={
              dataProfile?.otherInfo.workStatus === "OFFICIAL"
                ? "Chính thức"
                : dataProfile?.otherInfo.workStatus === "PROBATION"
                ? "Thử việc"
                : "Nghỉ việc"
            }
          />
          <InfoPersonal
            titleValue="Ngày nghỉ"
            value={dataProfile?.otherInfo.resignedDate ?? ""}
          />
          <InfoPersonal
            titleValue="Đã kiểm tra hồ sơ"
            value={
              dataProfile?.otherInfo.documentsChecked
                ? "Đã kiểm tra"
                : "Chưa kiểm tra"
            }
          />
          <InfoPersonal
            titleValue="Ngân hàng VCB"
            value={dataProfile?.otherInfo.VCB}
          />
          <InfoPersonal
            titleValue="MTCV"
            value={
              dataProfile?.otherInfo.MTCV
                ? "Có bảng MTCV"
                : "Không có bảng MTCV"
            }
          />
          <InfoPersonal
            titleValue="PNJ"
            value={dataProfile?.otherInfo.PNJ ? "R" : ""}
          />
        </div>
      </div>
      <button
        className="flex mt-4 gap-2 items-center h-10 px-4 rounded-2xl bg-gradient-to-r from-[#aa0404] to-[#350000] cursor-pointer text-white font-semibold"
        onClick={handleUpdateProfile}
      >
        <Send />
        Cập nhật
      </button>
    </div>
  );
};

export default Profile;
