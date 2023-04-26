import { BsCaretDownFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BiArrowToTop } from "react-icons/bi";
import { scrollOnTop } from "../../../utils/scollOnTop";
import { ImageType } from "../../../data/type/type";
import { COMMUNITY_PAGE } from "../../../data/routes/urls";
import useEmoSelect from "../hooks/useEmoSelect";
import useInfinite from "../hooks/useInfinite";
import EmotionIcons from "../../../components/Icon/EmoticonIcons";
import * as St from "../styles/BoardStyle";

const Boards = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramSort = searchParams.get("sort");
  const paramEmo = searchParams.get("emo");
  const navigate = useNavigate();
  const { clickEmojiHandler, emoNum, emoSelect } = useEmoSelect(paramEmo);

  // 최신순 or 인기순 선택모달
  const [listOpen, setListOpen] = useState<boolean>(false);

  // 서버에서 불러온 데이터를 배열에 저장
  const [postData, setPostData] = useState<ImageType[]>([]);
  const { data, fetchNextPage, hasNextPage, boardError } = useInfinite(
    paramSort,
    paramEmo
  );

  const emoChangeBtn = () => {
    if (paramSort) {
      setSearchParams({ sort: paramSort, emo: emoNum });
    } else {
      setSearchParams({ sort: "recent", emo: emoNum });
    }
  };

  const clickSortListButton = (str: string) => {
    setSearchParams({ sort: str, emo: emoNum });
  };

  // 스크롤 위치가 바닥에 닿았을때 다음 페이지 정보를 불러오는 함수
  const onScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    if (hasNextPage && window.innerHeight + scrollTop + 100 >= offsetHeight) {
      fetchNextPage({ cancelRefetch: false });
      saveScrollPosition();
    }
    saveScrollPosition();
  };

  // 스크롤 현재 위치를 저장
  function saveScrollPosition() {
    if (document.scrollingElement) {
      sessionStorage.setItem(
        "scrollPosition",
        document.documentElement.scrollTop.toString()
      );
    }
  }

  // 직전에 저장한 스크롤 위치가 있다면 그 위치로 이동
  function restoreScrollPosition() {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, Number(scrollPosition));
      }, 70);
      sessionStorage.removeItem("scrollPosition");
    }
  }

  useEffect(() => {
    if (data) {
      const newData = data.pages.reduce(
        (arr: never[] | ImageType[], cur) => [...arr, ...cur.data],
        []
      );
      setPostData(newData);
    }
  }, [data]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    restoreScrollPosition();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasNextPage]);

  useEffect(() => {
    emoChangeBtn();
  }, [emoNum]);

  if (boardError) {
    return <>에러</>;
  }

  return (
    <St.Container>
      <St.SelectBar>
        <St.SelectTitle
          onClick={(): void => setListOpen((pre: boolean): boolean => !pre)}
        >
          {paramSort === "popular" ? "인기순" : "최신순"}
          <BsCaretDownFill />
          {listOpen && (
            <St.Sort>
              <St.SortListBtn onClick={() => clickSortListButton("recent")}>
                최신순
              </St.SortListBtn>
              <St.SortListBtn onClick={() => clickSortListButton("popular")}>
                인기순
              </St.SortListBtn>
            </St.Sort>
          )}
        </St.SelectTitle>

        <St.ButtonBox>
          {new Array(6).fill(null).map((e, i) => (
            <St.StEmoButton
              key={i}
              onClick={() => clickEmojiHandler(i)}
              isClick={emoSelect[i]}
            >
              <EmotionIcons
                height="100%"
                width="100%"
                emotionTypes={`EMOTION_${i + 1}`}
              />
            </St.StEmoButton>
          ))}
        </St.ButtonBox>
      </St.SelectBar>
      <St.ImageContainer>
        {postData.map((item: ImageType, i: number) => (
          <St.ImageBox
            key={i}
            onClick={() => navigate(`${COMMUNITY_PAGE}/${item.id}`)}
          >
            <St.Image src={item.imgUrl} />
          </St.ImageBox>
        ))}
      </St.ImageContainer>
      <St.ScrollOntop onClick={scrollOnTop}>
        <BiArrowToTop />
      </St.ScrollOntop>
    </St.Container>
  );
};

export default Boards;
