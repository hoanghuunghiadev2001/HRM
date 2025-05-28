import { useEffect, useState } from "react";
import { ProfileInfo } from "./api";
import { GetProp, Input, message, Upload, UploadProps } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Send } from "lucide-react";
import { formatCurrency } from "./function";
import Image from "next/image";

interface ProfileProps {
  dataProfile?: ProfileInfo;
  updateProfile: (
    avt: string,
    phoneNumber: string,
    relativePhone: string,
    companyPhone: string,
    email: string
  ) => void;
}

interface InfoPersonalProps {
  titleValue: string;
  value?: string | number;
  canChange?: boolean;
  onChangeValue?: (value: string | number) => void;
}

const InfoPersonal = ({
  titleValue,
  value,
  canChange,
  onChangeValue,
}: InfoPersonalProps) => {
  return (
    <p className="font-bold text-[#242424] flex shrink-0 gap-2 items-center">
      <p className="shrink-0"> {titleValue + ":"}</p>
      {canChange === true ? (
        <Input
          placeholder=""
          className="m-0"
          value={value}
          onChange={
            onChangeValue ? (e) => onChangeValue(e.target.value) : () => {}
          }
        />
      ) : (
        <p className="inline font-medium text-[#3a3a3a]">{" " + value}</p>
      )}
    </p>
  );
};

const Profile = ({ dataProfile, updateProfile }: ProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [relativePhone, setRelativePhone] = useState<string>();
  const [companyPhone, setCompanyPhone] = useState<string>();
  const [email, setEmail] = useState<string>();

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

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
        setImageUrl(url.split(",")[1]);
      });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  useEffect(() => {
    setImageUrl(dataProfile?.avatar);
    setPhoneNumber(dataProfile?.contactInfo.phoneNumber);
    setRelativePhone(dataProfile?.contactInfo.relativePhone);
    setCompanyPhone(dataProfile?.contactInfo.companyPhone);
    setEmail(dataProfile?.contactInfo.email);
  }, [dataProfile]);

  return (
    <div className="flex flex-col items-center w-full">
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
              loading="lazy"
              src={imageUrl ? imageUrl : "/storage/avt-default.webp"}
              alt="avatar"
              style={{ width: "145px" }}
              className="rounded-[50%] h-[145px] object-cover"
              width={145}
              height={145}
              quality={70} // giảm chất lượng xuống chút để nhẹ hơn
              priority={false}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </div>
      <div className="w-full mt-3">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          1. Thông Tin Cá Nhân:
        </p>
        <div className="grid lg:grid-cols-3 grid-cols-1 max-[1024px]:grid-cols-2 mt-1 w-full pl-10  pr-6 gap-4">
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
      <div className="w-full mt-3">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          2. Thông Tin Liên Hệ:
        </p>
        <div className="grid grid-cols-3 mt-1 w-full pl-10  pr-6 gap-4">
          <div className="grid grid-cols-2">
            <p className="font-bold text-[#242424] shrink-0 ">Số điện thoại:</p>

            <Input
              maxLength={14}
              type="number"
              className="m-0"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2">
            <p className="font-bold text-[#242424] shrink-0 ">
              SĐT người thân:
            </p>

            <Input
              maxLength={14}
              className="m-0"
              type="number"
              value={relativePhone}
              onChange={(e) => setRelativePhone(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2">
            <p className="font-bold text-[#242424] shrink-0 ">SĐT công ty:</p>

            <Input
              maxLength={14}
              className="m-0"
              type="number"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2">
            <p className="font-bold text-[#242424] shrink-0 ">Email:</p>

            <Input
              className="m-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="w-full mt-3">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          3. Thông tin công việc:
        </p>
        <div className="grid grid-cols-3 mt-1 w-full pl-10  pr-6 gap-4">
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
      <div className="w-full mt-3">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          4. Chứng chỉ & Trình độ:
        </p>
        <div className="grid grid-cols-3 mt-1 w-full pl-10  pr-6 gap-4">
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
      <div className="w-full mt-3">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          5. Thông tin bảo hiểm / Thuế:
        </p>
        <div className="grid grid-cols-3 mt-1 w-full pl-10  pr-6 gap-4">
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
      <div className="w-full mt-3">
        <p className="font-bold  text-2xl text-[#4a4a6a]">
          6. Trạng thái và thông tin khác:
        </p>
        <div className="grid grid-cols-3 mt-1 w-full pl-10  pr-6 gap-4">
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
            value={dataProfile?.otherInfo.documentsChecked}
          />
          <InfoPersonal
            titleValue="Thời gian cập nhật"
            value={dataProfile?.otherInfo.updatedAt}
          />{" "}
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
        className="flex  gap-2 items-center h-10 px-4 rounded-2xl bg-gradient-to-r from-[#aa0404] to-[#350000] cursor-pointer text-white font-semibold"
        onClick={handleUpdateProfile}
      >
        <Send />
        Cập nhật
      </button>
    </div>
  );
};
export default Profile;
