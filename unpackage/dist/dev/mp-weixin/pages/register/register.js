"use strict";
const common_vendor = require("../../common/vendor.js");
const common_config = require("../../common/config.js");
const _sfc_main = {
  __name: "register",
  setup(__props) {
    const formData = common_vendor.ref({
      telephone: "",
      code: "",
      password: "",
      rePassword: ""
    });
    const errors = common_vendor.ref({
      phone: "",
      code: "",
      password: "",
      rePassword: ""
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
          url: `${common_config.websiteUrl}/send-sms-code`,
          method: "POST",
          data: { tel_phone: formData.value.telephone }
        });
        if (res.data.status === "success") {
          startCountdown();
          common_vendor.index.showToast({ title: "验证码已发送", icon: "none" });
        } else {
          common_vendor.index.showToast({ title: res.data.msg || "发送失败", icon: "none" });
        }
      } catch (err) {
        common_vendor.index.showToast({ title: "网络请求失败", icon: "none" });
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
    const validatePassword = () => {
      if (formData.value.password.length < 6) {
        errors.value.password = "密码至少需要6位";
        return false;
      }
      errors.value.password = "";
      return true;
    };
    const validateRePassword = () => {
      if (formData.value.password !== formData.value.rePassword) {
        errors.value.rePassword = "两次密码输入不一致";
        return false;
      }
      errors.value.rePassword = "";
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
    const handleRegister = async () => {
      const validations = [
        validatePhone(),
        validateCode(),
        validatePassword(),
        validateRePassword()
      ];
      if (!validations.every((v) => v))
        return;
      try {
        loading.value = true;
        const res = await common_vendor.index.request({
          url: `${common_config.websiteUrl}/register`,
          method: "POST",
          data: {
            telephone: formData.value.telephone,
            code: formData.value.code,
            password: formData.value.password,
            re_password: formData.value.rePassword
          }
        });
        if (res.data.status === "success") {
          common_vendor.index.setStorageSync("token", res.data.data.jwt_token);
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success",
            complete: () => {
              setTimeout(() => {
                common_vendor.index.switchTab({ url: "/pages/mine/mine" });
              }, 1500);
            }
          });
        } else {
          common_vendor.index.showToast({ title: res.data.msg || "注册失败", icon: "none" });
        }
      } catch (err) {
        common_vendor.index.showToast({ title: "网络请求失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    };
    const navigateToLogin = () => {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
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
        o: common_vendor.o(validatePassword),
        p: formData.value.password,
        q: common_vendor.o(($event) => formData.value.password = $event.detail.value),
        r: errors.value.password
      }, errors.value.password ? {
        s: common_vendor.t(errors.value.password)
      } : {}, {
        t: common_vendor.o(validateRePassword),
        v: formData.value.rePassword,
        w: common_vendor.o(($event) => formData.value.rePassword = $event.detail.value),
        x: errors.value.rePassword
      }, errors.value.rePassword ? {
        y: common_vendor.t(errors.value.rePassword)
      } : {}, {
        z: common_vendor.t(loading.value ? "注册中..." : "立即注册"),
        A: loading.value,
        B: common_vendor.o(handleRegister),
        C: loading.value ? 1 : "",
        D: common_vendor.o(navigateToLogin)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bac4a35d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
