import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePost } from "../features/post/hooks/usePost";
import { useInput } from "../features/post/hooks/useInput";
import styled from "styled-components";
import EmotionIcons from "../components/Icon/EmoticonIcons";
import Star from "../components/Icon/Star";
import Palette from "../features/post/components/Palette";
import { usePen } from "../features/post/hooks/usePen";
import { useEraser } from "../features/post/hooks/useEraser";
import {
  Coordinate,
  EmoButtonProps,
  IconProps,
  InputValue,
} from "../data/type/type";
import { StCanvasWrapper } from "../features/post/components/Canvas";
import PenTool from "../features/post/components/PenTool";
import { getCookie } from "../utils/cookies";
import BallPointPen from "../assets/Drawing/Ball Point Pen.png";
import Eraser from "../assets/Drawing/Erase.png";
import Reboot from "../assets/Drawing/Reboot.png";
import {
  MobileStarWrap,
  StLabel,
  StScoreBox,
  StSubmitBox,
  StTextArea,
  StarWrap,
} from "./ImagePost";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";
import { device, themeColor } from "../utils/theme";

const DrawingPost = () => {
  const token = getCookie("token");
  const refreshToken = getCookie("refreshToken");
  const navigate = useNavigate();

  // 날짜
  const params = useParams();
  const year: number | undefined = Number(params.date?.split("-")[0]);
  const month: number | undefined = Number(params.date?.split("-")[1]);
  const day: number | undefined = Number(params.date?.split("-")[2]);

  // 캔버스 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 글작성 조건 상태
  const [validPicture, setValidPicture] = useState<boolean>(false);
  const [validStar, setValidStar] = useState<boolean>(false);
  const [validEmoji, setValidEmoji] = useState<boolean>(false);

  const newItem: InputValue = {
    year,
    month,
    day,
    draw: true,
    emoId: 0,
    star: 0,
    detail: "",
    deleteImg: false,
    share: false,
    restrict: false,
  };
  const {
    onChangeHandler,
    onCheckHandler,
    clickEmojiHandler,
    inputValue,
    scoreStarHandler,
  } = useInput(newItem);

  const { submitDiaryHandler, savePictureHandler } = usePost({
    inputValue,
    canvasRef,
  });

  // 그림판 모드, 색깔 상태 관리
  const [mode, setMode] = useState<string>("pen");
  const [selectedColor, setSelectedColor] = useState<string>(
    themeColor.main.black
  );
  const [selectPen, setSelectPen] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<number>(5);

  // 좌표 함수
  const getCoordinates = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); // 캔버스의 뷰포트 상의 위치 정보를 가져옴
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const { startPaint, paint, exitPaint, moveTouch, startTouch, endTouch } =
    usePen(canvasRef, getCoordinates, selectedColor, selectedSize);

  const { startErase, erase, exitErase } = useEraser(canvasRef, getCoordinates);

  // 캔버스 비우기
  const clearCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.getContext("2d")!!.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 지우개, 펜 모드 변경 함수
  const switchModeHandler = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    const button = event.target as HTMLButtonElement;
    const value = button.value;
    if (value === "eraser") {
      setMode(value);
    } else {
      setMode(value);
      setSelectPen((pre) => !pre);
    }
  };

  // 색깔 변경 함수
  const selectColorHandler = (color: string): void => {
    setSelectedColor(color);
    setMode("pen");
  };

  const selectPenSizeHandler = (size: number): void => {
    setSelectedSize(size);
    setMode("pen");
  };

  const savePicture = () => {
    setValidPicture(true);
    savePictureHandler();
  };

  // useEffect + AddEventListener 대체 함수
  const mouseDownHandler = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    if (mode === "pen") {
      startPaint(event);
    } else if (mode === "eraser") {
      startErase(event);
    }
  };

  const mouseMoveHandler = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    if (mode === "pen") {
      paint(event);
    } else if (mode === "eraser") {
      erase(event);
    }
  };

  const mouseUpHandler = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (mode === "pen") {
      exitPaint();
    } else if (mode === "eraser") {
      exitErase();
    }
  };
  const mouseLeaveHandler = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    if (mode === "pen") {
      exitPaint();
    } else if (mode === "eraser") {
      exitErase();
    }
  };

  // 감정 선택
  const emoIds: number[] = [1, 2, 3, 4, 5, 6];

  // 별점
  const [clicked, setClicked] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);
  const starArray: number[] = [1, 2, 3, 4, 5];
  const clickStarHandler = (index: number): void => {
    setClicked(clicked.map((_, i) => i <= index - 1));
    scoreStarHandler(index);
  };

  const changeStarHandler = (score: number) => {
    clickStarHandler(score);
    setValidStar(true);
  };

  const changeEmojiHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    clickEmojiHandler(event);
    setValidEmoji(true);
  };

  // 글작성 함수
  const submitFormHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validEmoji === false || validStar === false) {
      alert("글 내용을 모두 입력해주세요.");
    }
    if (validEmoji && validStar) {
      submitDiaryHandler(event);
    }
  };

  useEffect(() => {
    if (!token && !refreshToken) {
      navigate("/");
    }
    const preventGoBack = () => {
      if (window.confirm("페이지를 나가시겠습니까?")) {
        navigate(-1);
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    // 새로고침 막기 변수
    const preventClose = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // chrome에서는 설정이 필요해서 넣은 코드
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventGoBack);
    window.addEventListener("beforeunload", preventClose);
    return () => {
      window.removeEventListener("popstate", preventGoBack);
      window.removeEventListener("beforeunload", preventClose);
    };
  }, [token]);

  return (
    <DrawPostWrap>
      <form onSubmit={submitFormHandler}>
        <Wrapper>
          <MobileStarWrap>
            {[1, 2, 3, 4, 5].map((score) => (
              <Star
                key={score}
                size="5vw"
                color={
                  clicked[score - 1]
                    ? themeColor.palette.yellow
                    : themeColor.main.oatmeal
                }
                onClick={() => changeStarHandler(score)}
              />
            ))}
          </MobileStarWrap>
          <StDrawWrap>
            <StCanvas
              ref={canvasRef}
              height={700}
              width={800}
              onMouseDown={mouseDownHandler}
              onMouseMove={mouseMoveHandler}
              onMouseUp={mouseUpHandler}
              onMouseLeave={mouseLeaveHandler}
              onTouchStart={startTouch}
              onTouchMove={moveTouch}
              onTouchEnd={endTouch}
            ></StCanvas>
            <StToolBox>
              <StToolList>
                <StPenSizeTool>
                  {selectPen ? (
                    <PenTool
                      color={selectedColor}
                      selectedSize={selectedSize}
                      onSizeSelect={selectPenSizeHandler}
                      setSelectPen={setSelectPen}
                    />
                  ) : null}
                </StPenSizeTool>
                <div>
                  {selectPen ? (
                    <>
                      <Palette
                        selectedColor={selectedColor}
                        onColorSelect={selectColorHandler}
                        setSelectPen={setSelectPen}
                      />
                    </>
                  ) : null}
                </div>
                <StPenButton
                  type="button"
                  value="pen"
                  url={BallPointPen}
                  onClick={switchModeHandler}
                ></StPenButton>
              </StToolList>
              <StToolList>
                <StEraserButton
                  url={Eraser}
                  type="button"
                  value="eraser"
                  onClick={switchModeHandler}
                ></StEraserButton>
              </StToolList>
              <StRebootButton
                type="button"
                url={Reboot}
                onClick={clearCanvas}
              ></StRebootButton>
            </StToolBox>
          </StDrawWrap>
          <DrawingPostWrap>
            <StCanvasWrapper>
              <StScoreBox>
                <StUnorderLi>
                  {emoIds.map((item: number) => (
                    <StList key={item}>
                      <StEmoButton
                        name="emoId"
                        type="button"
                        selected={inputValue.emoId === item ? true : false}
                        value={item}
                        onClick={changeEmojiHandler}
                      >
                        <EmotionIcons
                          height="50"
                          width="50"
                          emotionTypes={`EMOTION_${item}`}
                        />
                      </StEmoButton>
                    </StList>
                  ))}
                </StUnorderLi>
                <StarWrap>
                  {starArray.map((score) => (
                    <Star
                      key={score}
                      size="30"
                      color={
                        clicked[score - 1]
                          ? themeColor.palette.yellow
                          : themeColor.main.oatmeal
                      }
                      onClick={() => changeStarHandler(score)}
                    />
                  ))}
                  <p>{inputValue.star === 0 ? "?" : inputValue.star}</p>
                </StarWrap>
              </StScoreBox>
              <div>
                <label>
                  <StTextArea
                    name="detail"
                    value={inputValue?.detail}
                    spellCheck={false}
                    required
                    maxLength={1500}
                    onChange={onChangeHandler}
                  ></StTextArea>
                </label>
              </div>
              <StSubmitBox>
                <StLabel>
                  공유여부
                  <Checkbox
                    name="share"
                    checked={inputValue?.share === true}
                    onChange={onCheckHandler}
                  />
                </StLabel>
                {validPicture ? (
                  <Button
                    style={{
                      backgroundColor: themeColor.main.pink,
                      color: themeColor.main.white,
                    }}
                    size="large"
                    type="submit"
                  >
                    등록하기
                  </Button>
                ) : (
                  <Button size="large" type="button" onClick={savePicture}>
                    그림저장
                  </Button>
                )}
              </StSubmitBox>
            </StCanvasWrapper>
          </DrawingPostWrap>
        </Wrapper>
      </form>
    </DrawPostWrap>
  );
};

export default DrawingPost;

const DrawPostWrap = styled.div`
  height: 100vh;
  ${device.mobile} {
    overflow: auto;
  }
`;
const DrawingPostWrap = styled.div`
  width: 50vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${device.mobile} {
    width: 100%;
    height: 50%;
    overflow: auto;
    p {
      display: none;
    }
  }
`;
export const StList = styled.li`
  list-style-type: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Wrapper = styled.div`
  display: flex;
  ${device.mobile} {
    display: flex;
    flex-direction: column;
  }
`;

const StDrawWrap = styled.div`
  width: 50vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${device.mobile} {
    width: 100vw;
    height: 50vh;
    margin: 0;
  }
`;

export const StUnorderLi = styled.ul`
  min-width: 300px;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: row;
  ${device.tablet} {
    margin-bottom: 0;
    margin-top: 10px;
  }
  ${device.mobile} {
    margin-bottom: 10px;
  }
`;

export const StEmoButton = styled.button<EmoButtonProps>`
  width: 55px;
  height: 55px;
  border: ${(props) =>
    props.selected
      ? `5px solid ${themeColor.main.gray}`
      : "5px solid transparent"};
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:focus {
    border: 5px solid ${themeColor.main.gray};
  }
  &:hover {
    border: 5px solid ${themeColor.main.gray};
  }
`;

export const StCanvas = styled.canvas`
  position: unset;
  background-color: ${themeColor.main.white};
  width: 85%;
  height: 90%;
  ${device.mobile} {
    display: flex;
    flex-direction: column;
  }
`;

export const StToolBox = styled.div`
  display: flex;
  width: 40vw;
  height: 7vh;
  justify-content: flex-end;
  align-items: center;
  ${device.mobile} {
    width: 80vw;
  }
`;

export const StToolList = styled.li`
  list-style: none;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StPenSizeTool = styled.div`
  position: absolute;
  top: -16vh;
  right: -0.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  ${device.tablet} {
    top: -16vh;
    right: -1.5vw;
  }
  ${device.mobile} {
    top: -18vh;
    right: -1.5vw;
  }
`;

export const StPenButton = styled.button<IconProps>`
  background-image: ${({ url }) => `url(${url})`};
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 1.5vw;
  height: 1.5vw;
  border: none;
  ${device.mobile} {
    width: 20px;
    height: 20px;
  }
`;

export const StEraserButton = styled.button<IconProps>`
  background-image: ${({ url }) => `url(${url})`};
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 1.5vw;
  height: 1.5vw;
  border: none;
  margin: 5px;
  ${device.mobile} {
    width: 20px;
    height: 20px;
  }
`;

export const StRebootButton = styled.button<IconProps>`
  background-image: ${({ url }) => `url(${url})`};
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 1.2vw;
  height: 1.2vw;
  border: none;
  margin: 5px;
  ${device.mobile} {
    width: 20px;
    height: 20px;
  }
`;
