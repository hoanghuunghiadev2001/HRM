// import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";

interface ModalChangePassEmployeeProps {
  open: boolean;
  onClose: () => void;
  handleChangPass: (Password: string) => void;
}
const ModalChangePassEmployee = ({
  onClose,
  open,
  handleChangPass,
}: ModalChangePassEmployeeProps) => {
  const [form] = Form.useForm();
  const [clientReady, setClientReady] = useState<boolean>(false);

  // To disable submit button at the beginning.
  useEffect(() => {
    setClientReady(true);
    form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  type FieldType = {
    newPassword?: string;
    renewPassword?: string;
  };

  // const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  //   console.log('Failed:', errorInfo);
  // };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    handleChangPass(values.newPassword);
  };
  return (
    <Modal
      title={<p className="text-center text-2xl font-bold">Đổi mật khẩu</p>}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        name="horizontal_login"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType>
          label="Nhập lại mật khẩu mới"
          name="renewPassword"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Nhập lại mật khẩu mới!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <div className="flex justify-center mt-5">
          <Form.Item shouldUpdate>
            {() => (
              <Button
                className="!h-10 px-4"
                type="primary"
                htmlType="submit"
                disabled={
                  !clientReady ||
                  !form.isFieldsTouched(true) ||
                  !!form.getFieldsError().filter(({ errors }) => errors.length)
                    .length
                }
              >
                Đổi mật khẩu
              </Button>
            )}
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
export default ModalChangePassEmployee;
