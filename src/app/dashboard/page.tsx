"use client";
import { useEffect, useState } from "react";
import {
  Form,
  GetProp,
  Input,
  message,
  Modal,
  Upload,
  UploadProps,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Send } from "lucide-react";
import { fetchUser, ProfileInfo } from "@/components/api";
import { formatCurrency } from "@/components/function";
import ModalLoading from "@/components/modalLoading";
import Image from "next/image";
import InfoPersonal from "@/components/infoPersonal";

// interface ProfileProps {
//   dataProfile?: ProfileInfo;
//   updateProfile: (
//     avt: string,
//     phoneNumber: string,
//     relativePhone: string,
//     companyPhone: string,
//     email: string
//   ) => void;
// }

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [relativePhone, setRelativePhone] = useState<string>();
  const [companyPhone, setCompanyPhone] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [dataProfile, setDataProfile] = useState<ProfileInfo>();
  const [modal, contextHolder] = Modal.useModal();

  const fetchProfile = async () => {
    setLoading(true);
    const res = await fetch("/api/profile/profile");
    if (res.ok) {
      const data = await res.json();
      setDataProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const updateProfile = async (
    avt: string,
    phoneNumber: string,
    relativePhone: string,
    companyPhone: string,
    email: string
  ) => {
    setLoading(true);
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
      setLoading(false);
      fetchProfile();
      countDown();
      fetchUser();
    } else {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    if (
      imageUrl === dataProfile?.avatar &&
      phoneNumber === dataProfile?.contactInfo.phoneNumber &&
      relativePhone === dataProfile?.contactInfo.relativePhone &&
      companyPhone === dataProfile?.contactInfo.companyPhone &&
      email === dataProfile?.contactInfo.email
    ) {
      return;
    }
    updateProfile(
      imageUrl ?? "",
      phoneNumber ?? "",
      relativePhone ?? "",
      companyPhone ?? "",
      email ?? ""
    );
  };

  //Up ảnh hồ sơ
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
  //chuyển ảnh sang base64
  const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
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

  useEffect(() => {
    // setImageUrl(dataProfile?.avatar);
    setPhoneNumber(dataProfile?.contactInfo.phoneNumber);
    setRelativePhone(dataProfile?.contactInfo.relativePhone);
    setCompanyPhone(dataProfile?.contactInfo.companyPhone);
    setEmail(dataProfile?.contactInfo.email);
  }, [dataProfile]);

  return (
    <div className="flex flex-col items-center w-full">
      <ModalLoading isOpen={loading} />
      {contextHolder}
      <div className="w-full">
        <p className="font-bold  text-2xl text-[#4a4a6a]">Hồ sơ cá nhân:</p>
      </div>
      <div className="mt-3 ">
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader w-[155px] h-[155px] flex justify-center items-center"
          showUploadList={false}
          // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? (
            <Image
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
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          1. Thông Tin Cá Nhân:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4  pr-4 gap-4  border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
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
          <InfoPersonal titleValue="Số điện thoại" value={phoneNumber} />
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
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          2. Thông Tin Liên Hệ:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4  pr-4 gap-4  border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
          <div className="flex  gap-2 items-start">
            <p className="font-bold text-[#242424] flex-shrink-0 ">
              Số điện thoại:
            </p>
            <Form
            // onFinish={onFinish}
            // style={{ maxWidth: 600 }}
            >
              <Form.Item
                name={["number"]}
                valuePropName={phoneNumber}
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <Input
                  maxLength={14}
                  type="number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Form.Item>
            </Form>
          </div>
          <div className="flex  gap-2 items-start">
            <p className="font-bold text-[#242424] flex-shrink-0 ">
              SĐT người thân:
            </p>
            <Form
            // onFinish={onFinish}
            // style={{ maxWidth: 600 }}
            >
              <Form.Item
                name={["number"]}
                valuePropName={relativePhone}
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <Input
                  maxLength={14}
                  type="number"
                  value={relativePhone}
                  onChange={(e) => setRelativePhone(e.target.value)}
                />
              </Form.Item>
            </Form>
          </div>
          <div className="flex  gap-2 items-start">
            <p className="font-bold text-[#242424] flex-shrink-0 ">
              SĐT công ty:
            </p>
            <Form
            // onFinish={onFinish}
            // style={{ maxWidth: 600 }}
            >
              <Form.Item
                name={["number"]}
                valuePropName={companyPhone}
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <Input
                  maxLength={14}
                  type="number"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </Form.Item>
            </Form>
          </div>
          <div className="flex  gap-2 items-start">
            <p className="font-bold text-[#242424] flex-shrink-0 ">Email:</p>
            <Form
            // onFinish={onFinish}
            // style={{ maxWidth: 600 }}
            >
              <Form.Item valuePropName={email} rules={[{ type: "email" }]}>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          3. Thông tin công việc:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4  pr-4 gap-4  border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
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
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          4. Chứng chỉ & Trình độ:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4  pr-4 gap-4  border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
          <InfoPersonal
            titleValue="Trình độ học vấn"
            value={dataProfile?.personalInfo.education}
          />
          <InfoPersonal
            titleValue="Bằng lái xe"
            value={dataProfile?.personalInfo.drivingLicense}
          />
          <InfoPersonal
            titleValue="Chứng chỉ Toyota	"
            value={dataProfile?.personalInfo.toyotaCertificate}
          />
        </div>
      </div>
      <div className="w-full mt-5">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          5. Thông tin bảo hiểm / Thuế:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4  pr-4 gap-4  border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
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
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          6. Trạng thái và thông tin khác:
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-1 w-full pl-4  pr-4 gap-4  border border-[#e6e6e6] shadow-xl p-4 rounded-xl">
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
          />{" "}
          <InfoPersonal
            titleValue="MTCV"
            value={
              dataProfile?.otherInfo.MTCV
                ? "Có bảng MTCV"
                : "Không có bảng MTCV"
            }
          />{" "}
          <InfoPersonal
            titleValue="PNJ"
            value={dataProfile?.otherInfo.PNJ ? "R" : ""}
          />
        </div>
      </div>
      <button
        className="flex mt-4  gap-2 items-center h-10 px-4 rounded-2xl bg-gradient-to-r from-[#aa0404] to-[#350000] cursor-pointer text-white font-semibold"
        onClick={handleUpdateProfile}
      >
        <Send />
        Cập nhật
      </button>
    </div>
  );
};
export default Profile;
