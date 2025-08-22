"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
if (!Array) {
  const _easycom_view_logs2 = common_vendor.resolveComponent("view-logs");
  _easycom_view_logs2();
}
const _easycom_view_logs = () => "../../components/view-logs/view-logs.js";
if (!Math) {
  _easycom_view_logs();
}
const _sfc_main = {
  __name: "reset_password",
  setup(__props) {
    const formData = common_vendor.ref({
      telephone: "",
      code: "",
      newPassword: "",
      reNewPassword: ""
    });
    const errors = common_vendor.ref({
      phone: "",
      code: "",
      newPassword: "",
      reNewPassword: ""
    });
    const codeCountdown = common_vendor.ref(0);
    const codeBtnDisabled = common_vendor.computed(() => codeCountdown.value > 0);
    const codeBtnText = common_vendor.computed(
      () => codeCountdown.value > 0 ? `${codeCountdown.value}秒后重发` : "获取验证码"
    );
    const loading = common_vendor.ref(false);
    const validatePhone = () => {
      if (!formData.value.telephone) {
        errors.value.phone = "手机号不能为空";
        return false;
      }
      if (!/^1[3-9]\d{9}$/.test(formData.value.telephone)) {
        errors.value.phone = "手机号格式不正确";
        return false;
      }
      errors.value.phone = "";
      return true;
    };
    const sendSmsCode = async () => {
      if (!validatePhone())
        return;
      try {
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/send-sms-code`,
          // 根据实际接口调整
          method: "POST",
          data: {
            tel_phone: formData.value.telephone
          }
        });
        if (res.data.status === "success") {
          startCountdown();
          common_vendor.index.showToast({
            title: "验证码已发送",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "发送失败",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    };
    const validateNewPassword = () => {
      if (formData.value.newPassword.length < 6) {
        errors.value.newPassword = "密码至少需要6位";
        return false;
      }
      errors.value.newPassword = "";
      return true;
    };
    const validateReNewPassword = () => {
      if (formData.value.newPassword !== formData.value.reNewPassword) {
        errors.value.reNewPassword = "两次密码输入不一致";
        return false;
      }
      errors.value.reNewPassword = "";
      return true;
    };
    const validateCode = () => {
      if (!formData.value.code) {
        errors.value.code = "验证码不能为空";
        return false;
      }
      if (formData.value.code.length !== 6) {
        errors.value.code = "验证码格式不正确";
        return false;
      }
      errors.value.code = "";
      return true;
    };
    const handleResetPassword = async () => {
      const validations = [
        validatePhone(),
        validateCode(),
        validateNewPassword(),
        validateReNewPassword()
      ];
      if (!validations.every((v) => v))
        return;
      try {
        loading.value = true;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl.value}/reset-password`,
          // 修改为重置密码接口
          method: "POST",
          data: {
            telephone: formData.value.telephone,
            code: formData.value.code,
            password: formData.value.newPassword,
            re_password: formData.value.reNewPassword
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.showToast({
            title: "密码重置成功",
            icon: "success",
            complete: () => {
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            }
          });
        } else {
          common_vendor.index.showToast({
            title: res.data.msg || "重置失败",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const startCountdown = () => {
      codeCountdown.value = 60;
      const timer = setInterval(() => {
        if (codeCountdown.value <= 0) {
          clearInterval(timer);
          return;
        }
        codeCountdown.value--;
      }, 1e3);
    };
    const navigateToLogin = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(validatePhone),
        b: formData.value.telephone,
        c: common_vendor.o(($event) => formData.value.telephone = $event.detail.value),
        d: errors.value.phone
      }, errors.value.phone ? {
        e: common_vendor.t(errors.value.phone)
      } : {}, {
        f: common_vendor.o(validateCode),
        g: formData.value.code,
        h: common_vendor.o(($event) => formData.value.code = $event.detail.value),
        i: common_vendor.t(codeBtnText.value),
        j: codeBtnDisabled.value,
        k: common_vendor.o(sendSmsCode),
        l: codeBtnDisabled.value ? 1 : "",
        m: errors.value.code
      }, errors.value.code ? {
        n: common_vendor.t(errors.value.code)
      } : {}, {
        o: common_vendor.o(validateNewPassword),
        p: formData.value.newPassword,
        q: common_vendor.o(($event) => formData.value.newPassword = $event.detail.value),
        r: errors.value.newPassword
      }, errors.value.newPassword ? {
        s: common_vendor.t(errors.value.newPassword)
      } : {}, {
        t: common_vendor.o(validateReNewPassword),
        v: formData.value.reNewPassword,
        w: common_vendor.o(($event) => formData.value.reNewPassword = $event.detail.value),
        x: errors.value.reNewPassword
      }, errors.value.reNewPassword ? {
        y: common_vendor.t(errors.value.reNewPassword)
      } : {}, {
        z: common_vendor.t(loading.value ? "提交中..." : "重置密码"),
        A: loading.value,
        B: common_vendor.o(handleResetPassword),
        C: loading.value ? 1 : "",
        D: common_vendor.o(navigateToLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7140db85"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/reset_password/reset_password.js.map
