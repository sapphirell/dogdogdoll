var __wxsModules={};

__wxsModules["8ab5efd6"] = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // <stdin>
  var require_stdin = __commonJS({
    "<stdin>"(exports, module) {
      var startTouchs = [];
      var startDistance = 0;
      var touchCenter = [];
      var ratio = 0;
      var imageInstance = null;
      var cropperInstance = null;
      var touchType = "";
      var touchInstance = null;
      var cropperRect = null;
      var imageRect = null;
      var rotateAngle = 0;
      var changes = {
        imageRect: null,
        cropperRect: null
      };
      function updateImageStyle() {
        var imageRect2 = changes.imageRect;
        imageInstance.setStyle({
          left: imageRect2.left + "px",
          top: imageRect2.top + "px",
          width: imageRect2.width + "px",
          height: imageRect2.height + "px",
          transform: "rotate(" + rotateAngle + "deg)"
        });
      }
      function updateCopperStyle() {
        var cropperRect2 = changes.cropperRect;
        cropperInstance.setStyle({
          left: cropperRect2.left + "px",
          top: cropperRect2.top + "px",
          width: cropperRect2.width + "px",
          height: cropperRect2.height + "px"
        });
      }
      function imageScale(scaleRate) {
        var cw = imageRect.width * (scaleRate - 1);
        var ch = imageRect.height * (scaleRate - 1);
        changes.imageRect = {
          width: imageRect.width + cw,
          height: imageRect.height + ch,
          left: imageRect.left - cw * touchCenter[0],
          top: imageRect.top - ch * touchCenter[1]
        };
      }
      function ang2deg(ang) {
        return ang / 180 * Math.PI;
      }
      function getRealSize() {
        var w = changes.imageRect.width;
        var h = changes.imageRect.height;
        var l = changes.imageRect.left;
        var t = changes.imageRect.top;
        var R = Math.sqrt(w * w + h * h);
        var angle = Math.atan(h / w) / Math.PI * 180;
        var rorate = rotateAngle % 90;
        var direct = Math.floor(rotateAngle / 90);
        var width = R * Math.cos(ang2deg(angle - rorate));
        var height = R * Math.sin(ang2deg(angle + rorate));
        if (direct % 2 === 1) {
          var temp = width;
          width = height;
          height = temp;
        }
        return {
          width,
          height,
          left: l - (width - w) / 2,
          top: t - (height - h) / 2,
          dw: width - w,
          dh: height - h
        };
      }
      module.exports = {
        touchStart: function(ev, oi) {
          ev.preventDefault();
          ev.stopPropagation();
          touchInstance = ev.instance;
          var dataSet = ev.instance.getDataset();
          touchType = dataSet.type;
          startTouchs = ev.touches;
          oi.callMethod("onTouchStart");
          if (startTouchs.length == 2) {
            touchType = "image";
            var x1 = startTouchs[0].clientX;
            var y1 = startTouchs[0].clientY;
            var x2 = startTouchs[1].clientX;
            var y2 = startTouchs[1].clientY;
            var distance = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
            startDistance = Math.sqrt(distance);
            var leftPercent = ((x1 + x2) / 2 - imageRect.left) / imageRect.width;
            var topPercent = ((y1 + y2) / 2 - imageRect.top) / imageRect.height;
            touchCenter = [leftPercent, topPercent];
          }
          return false;
        },
        touchMove: function(ev, io) {
          if (touchType == "")
            return false;
          var touches = ev.touches;
          var changeX1 = touches[0].clientX - startTouchs[0].clientX;
          var changeY1 = touches[0].clientY - startTouchs[0].clientY;
          if (startTouchs.length == 1) {
            if (touchType === "image") {
              changes.imageRect.left = imageRect.left + changeX1;
              changes.imageRect.top = imageRect.top + changeY1;
              updateImageStyle();
            } else if (touchType === "controller") {
              var directionX = 0;
              if (touchInstance.hasClass("left")) {
                directionX = -1;
              }
              if (touchInstance.hasClass("right")) {
                directionX = 1;
              }
              var directionY = 0;
              if (touchInstance.hasClass("top")) {
                directionY = -1;
              }
              if (touchInstance.hasClass("bottom")) {
                directionY = 1;
              }
              var changeX = changeX1 * directionX;
              var changeY = changeY1 * directionY;
              if (ratio !== 0) {
                if (directionX * directionY !== 0) {
                  if (changeX / ratio > changeY) {
                    changeY = changeX / ratio;
                    changeX = changeY * ratio;
                  } else {
                    changeX = changeY * ratio;
                    changeY = changeX / ratio;
                  }
                } else {
                  if (directionX == 0) {
                    changeX = changeY * ratio;
                  } else {
                    changeY = changeX / ratio;
                  }
                }
              }
              var realSize = getRealSize();
              var width = cropperRect.width + changeX;
              var height = cropperRect.height + changeY;
              var imageRight = realSize.left + realSize.width;
              var imageBottom = realSize.top + realSize.height;
              if (directionX != -1) {
                if (cropperRect.left + width > imageRight) {
                  width = imageRight - cropperRect.left;
                  if (ratio !== 0) {
                    height = width / ratio;
                  }
                }
              } else {
                var cLeft = cropperRect.left - changeX;
                if (cLeft < realSize.left) {
                  width = cropperRect.left + cropperRect.width - realSize.left;
                  if (ratio !== 0) {
                    height = width / ratio;
                  }
                }
              }
              if (directionY != -1) {
                if (cropperRect.top + height > imageBottom) {
                  height = imageBottom - cropperRect.top;
                  if (ratio !== 0) {
                    width = height * ratio;
                  }
                }
              } else {
                var cTop = cropperRect.top - changeY;
                if (cTop < realSize.top) {
                  height = cropperRect.top + cropperRect.height - realSize.top;
                  if (ratio !== 0) {
                    width = height * ratio;
                  }
                }
              }
              if (directionX == -1) {
                changes.cropperRect.left = cropperRect.left + cropperRect.width - width;
              }
              if (directionY == -1) {
                changes.cropperRect.top = cropperRect.top + cropperRect.height - height;
              }
              changes.cropperRect.width = width;
              changes.cropperRect.height = height;
              updateCopperStyle();
            }
          } else if (touches.length == 2 && startTouchs.length == 2) {
            var changeX2 = touches[0].clientX - touches[1].clientX;
            var changeY2 = touches[0].clientY - touches[1].clientY;
            var distance = Math.pow(changeX2, 2) + Math.pow(changeY2, 2);
            distance = Math.sqrt(distance);
            var scaleRate = distance / startDistance;
            imageScale(scaleRate);
            updateImageStyle();
          }
          return false;
        },
        touchEnd: function(ev, oi) {
          if (touchType === "image") {
            var cropperLeft = cropperRect.left;
            var cropperRight = cropperRect.left + cropperRect.width;
            var cropperTop = cropperRect.top;
            var cropperBottom = cropperTop + cropperRect.height;
            var cropperRate = cropperRect.width / cropperRect.height;
            var realSize = getRealSize();
            var rate = realSize.width / realSize.height;
            if (realSize.width < cropperRect.width || realSize.height < cropperRect.height) {
              var scale = 1;
              if (rate < cropperRate) {
                scale = cropperRect.width / realSize.width;
              } else {
                scale = cropperRect.height / realSize.height;
              }
              imageRect.width = changes.imageRect.width;
              imageRect.height = changes.imageRect.height;
              imageScale(scale);
            }
            if (cropperLeft < realSize.left) {
              changes.imageRect.left = cropperLeft + realSize.dw / 2;
            }
            if (cropperRight > realSize.left + realSize.width) {
              changes.imageRect.left = cropperRight - realSize.width + realSize.dw / 2;
            }
            if (cropperTop < realSize.top) {
              changes.imageRect.top = cropperTop + realSize.dh / 2;
            }
            if (cropperBottom > realSize.top + realSize.height) {
              changes.imageRect.top = cropperBottom - realSize.height + realSize.dh / 2;
            }
            updateImageStyle();
          }
          oi.callMethod("updateData", {
            cropperRect: changes.cropperRect,
            imageRect: changes.imageRect
          });
          touchType = "";
          startTouchs = [];
          return false;
        },
        // 将逻辑层的图像变换同步过来
        // 裁剪比例变化
        changeRatio: function(value) {
          ratio = value;
        },
        changeRotateAngle: function(value) {
          rotateAngle = value;
          if (imageInstance) {
            updateImageStyle();
          }
          var realSize = getRealSize();
        },
        changeImageRect: function(value, oldValue, oi) {
          if (value) {
            imageRect = value;
            changes.imageRect = {
              left: value.left,
              top: value.top,
              width: value.width,
              height: value.height
            };
            setTimeout(function() {
              imageInstance = oi.selectComponent(".mainContent > .image");
              updateImageStyle();
            });
          }
        },
        changeCropper: function(value, oldValue, oi) {
          if (value) {
            cropperRect = value;
            changes.cropperRect = {
              left: value.left,
              top: value.top,
              width: value.width,
              height: value.height
            };
            setTimeout(function() {
              cropperInstance = oi.selectComponent(".mainContent > .cropper");
              updateCopperStyle();
            });
          }
        }
      };
    }
  });
  return require_stdin();
})();


__wxsModules["2f992f8c"] = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // <stdin>
  var require_stdin = __commonJS({
    "<stdin>"(exports, module) {
      var inlineTags = {
        abbr: true,
        b: true,
        big: true,
        code: true,
        del: true,
        em: true,
        i: true,
        ins: true,
        label: true,
        q: true,
        small: true,
        span: true,
        strong: true,
        sub: true,
        sup: true
      };
      module.exports = {
        isInline: function(tagName, style) {
          return inlineTags[tagName] || (style || "").indexOf("display:inline") !== -1;
        }
      };
    }
  });
  return require_stdin();
})();


__wxsModules.afd46426 = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // <stdin>
  var require_stdin = __commonJS({
    "<stdin>"(exports, module) {
      var MIN_DISTANCE = 10;
      var IS_HTML5 = false;
      if (typeof window === "object")
        IS_HTML5 = true;
      function showWatch(newVal, oldVal, ownerInstance, instance) {
        var state = instance.getState();
        getDom(instance, ownerInstance);
        if (newVal && newVal !== "none") {
          openState(newVal, instance, ownerInstance);
          return;
        }
        if (state.left) {
          openState("none", instance, ownerInstance);
        }
        resetTouchStatus(instance);
      }
      function touchstart(e, ownerInstance) {
        var instance = e.instance;
        var disabled = instance.getDataset().disabled;
        var state = instance.getState();
        getDom(instance, ownerInstance);
        disabled = (typeof disabled === "string" ? JSON.parse(disabled) : disabled) || false;
        if (disabled)
          return;
        instance.requestAnimationFrame(function() {
          instance.removeClass("ani");
          ownerInstance.callMethod("closeSwipe");
        });
        state.x = state.left || 0;
        stopTouchStart(e, ownerInstance);
      }
      function touchmove(e, ownerInstance) {
        var instance = e.instance;
        var disabled = instance.getDataset().disabled;
        var state = instance.getState();
        disabled = (typeof disabled === "string" ? JSON.parse(disabled) : disabled) || false;
        if (disabled)
          return;
        stopTouchMove(e);
        if (state.direction !== "horizontal") {
          return;
        }
        if (e.preventDefault) {
          e.preventDefault();
        }
        move(state.x + state.deltaX, instance, ownerInstance);
      }
      function touchend(e, ownerInstance) {
        var instance = e.instance;
        var disabled = instance.getDataset().disabled;
        var state = instance.getState();
        disabled = (typeof disabled === "string" ? JSON.parse(disabled) : disabled) || false;
        if (disabled)
          return;
        moveDirection(state.left, instance, ownerInstance);
      }
      function move(value, instance, ownerInstance) {
        value = value || 0;
        var state = instance.getState();
        var leftWidth = state.leftWidth;
        var rightWidth = state.rightWidth;
        state.left = range(value, -rightWidth, leftWidth);
        instance.requestAnimationFrame(function() {
          instance.setStyle({
            transform: "translateX(" + state.left + "px)",
            "-webkit-transform": "translateX(" + state.left + "px)"
          });
        });
      }
      function getDom(instance, ownerInstance) {
        var state = instance.getState();
        var leftDom = ownerInstance.selectComponent(".button-group--left");
        var rightDom = ownerInstance.selectComponent(".button-group--right");
        var leftStyles = {
          width: 0
        };
        var rightStyles = {
          width: 0
        };
        leftStyles = leftDom.getBoundingClientRect();
        rightStyles = rightDom.getBoundingClientRect();
        state.leftWidth = leftStyles.width || 0;
        state.rightWidth = rightStyles.width || 0;
        state.threshold = instance.getDataset().threshold;
      }
      function range(num, min, max) {
        return Math.min(Math.max(num, min), max);
      }
      function moveDirection(left, ins, ownerInstance) {
        var state = ins.getState();
        var threshold = state.threshold;
        var position = state.position;
        var isopen = state.isopen || "none";
        var leftWidth = state.leftWidth;
        var rightWidth = state.rightWidth;
        if (state.deltaX === 0) {
          openState("none", ins, ownerInstance);
          return;
        }
        if (isopen === "none" && rightWidth > 0 && -left > threshold || isopen !== "none" && rightWidth > 0 && rightWidth + left < threshold) {
          openState("right", ins, ownerInstance);
        } else if (isopen === "none" && leftWidth > 0 && left > threshold || isopen !== "none" && leftWidth > 0 && leftWidth - left < threshold) {
          openState("left", ins, ownerInstance);
        } else {
          openState("none", ins, ownerInstance);
        }
      }
      function openState(type, ins, ownerInstance) {
        var state = ins.getState();
        var leftWidth = state.leftWidth;
        var rightWidth = state.rightWidth;
        var left = "";
        state.isopen = state.isopen ? state.isopen : "none";
        switch (type) {
          case "left":
            left = leftWidth;
            break;
          case "right":
            left = -rightWidth;
            break;
          default:
            left = 0;
        }
        if (state.isopen !== type) {
          state.throttle = true;
          ownerInstance.callMethod("change", {
            open: type
          });
        }
        state.isopen = type;
        ins.requestAnimationFrame(function() {
          ins.addClass("ani");
          move(left, ins, ownerInstance);
        });
      }
      function getDirection(x, y) {
        if (x > y && x > MIN_DISTANCE) {
          return "horizontal";
        }
        if (y > x && y > MIN_DISTANCE) {
          return "vertical";
        }
        return "";
      }
      function resetTouchStatus(instance) {
        var state = instance.getState();
        state.direction = "";
        state.deltaX = 0;
        state.deltaY = 0;
        state.offsetX = 0;
        state.offsetY = 0;
      }
      function stopTouchStart(event) {
        var instance = event.instance;
        var state = instance.getState();
        resetTouchStatus(instance);
        var touch = event.touches[0];
        if (IS_HTML5 && isPC()) {
          touch = event;
        }
        state.startX = touch.clientX;
        state.startY = touch.clientY;
      }
      function stopTouchMove(event) {
        var instance = event.instance;
        var state = instance.getState();
        var touch = event.touches[0];
        if (IS_HTML5 && isPC()) {
          touch = event;
        }
        state.deltaX = touch.clientX - state.startX;
        state.deltaY = touch.clientY - state.startY;
        state.offsetY = Math.abs(state.deltaY);
        state.offsetX = Math.abs(state.deltaX);
        state.direction = state.direction || getDirection(state.offsetX, state.offsetY);
      }
      function isPC() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length - 1; v++) {
          if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
          }
        }
        return flag;
      }
      var movable = false;
      function mousedown(e, ins) {
        if (!IS_HTML5)
          return;
        if (!isPC())
          return;
        touchstart(e, ins);
        movable = true;
      }
      function mousemove(e, ins) {
        if (!IS_HTML5)
          return;
        if (!isPC())
          return;
        if (!movable)
          return;
        touchmove(e, ins);
      }
      function mouseup(e, ins) {
        if (!IS_HTML5)
          return;
        if (!isPC())
          return;
        touchend(e, ins);
        movable = false;
      }
      function mouseleave(e, ins) {
        if (!IS_HTML5)
          return;
        if (!isPC())
          return;
        movable = false;
      }
      module.exports = {
        showWatch,
        touchstart,
        touchmove,
        touchend,
        mousedown,
        mousemove,
        mouseup,
        mouseleave
      };
    }
  });
  return require_stdin();
})();
