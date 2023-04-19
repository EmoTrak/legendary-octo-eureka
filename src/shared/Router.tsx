import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Detail from "../pages/Detail";
import ImagePost from "../pages/ImagePost";
import DrawingPost from "../pages/DrawingPost";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Community from "../pages/Community";
import CommunityDetail from "../pages/CommunityDetail";
import Chart from "../pages/Chart";
import RedirectKakao from "../pages/RedirectKakao";
import ImageEdit from "../pages/ImageEdit";
import DrawEdit from "../pages/DrawEdit";
import Admin from "../pages/Admin";
import Layout from "../layouts/Layout";
import Mypage from "../pages/Mypage";
import AdminComment from "../features/admin/components/AdminComment";
import AdminPost from "../features/admin/components/AdminPost";
import RedirectNaver from "../pages/RedirectNaver";
import RedirectGoogle from "../pages/RedirectGoogle";
import * as PAGE from "../data/routes/urls";
import { getCookie } from "../utils/cookies";
import { IPayload } from "../data/type/d2";
import { ProtectedRoute } from "./ProtectedRouter";

const Router = () => {
  const token = getCookie("token");
  let payloadJson;
  let payload!: IPayload;
  const [headerB64, payloadB64, signatureB64] = (token || "").split(".");
  if (typeof atob !== undefined && payloadB64) {
    payloadJson = atob(payloadB64);
  }
  if (payloadJson !== undefined) {
    payload = JSON.parse(payloadJson);
  }
  const pages = [
    {
      pathname: "/",
      element: <Home />,
      isPublic: false,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.LOGIN_PAGE}`,
      element: <Login />,
      isPublic: true,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.SIGN_UP_PAGE}`,
      element: <Signup />,
      isPublic: true,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.MY_PAGE}`,
      element: <Mypage />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.IMAGE_POST_PAGE}/:date`,
      element: <ImagePost />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.DRAW_POST_PAGE}/:date`,
      element: <DrawingPost />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.DETAIL_PAGE}/:id`,
      element: <Detail />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.IMAGE_EDIT_PAGE}/:id`,
      element: <ImageEdit />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.DRAW_EDIT_PAGE}/:id`,
      element: <DrawEdit />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.CHART_PAGE}`,
      element: <Chart />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.COMMUNITY_PAGE}`,
      element: <Community />,
      isPublic: true,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.COMMUNITY_DETAIL}/:id`,
      element: <CommunityDetail />,
      isPublic: true,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.OAUTH_KAKAO}`,
      element: <RedirectKakao />,
      isPublic: true,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.OAUTH_NAVER}`,
      element: <RedirectNaver />,
      isPublic: true,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.OAUTH_GOOGLE}`,
      element: <RedirectGoogle />,
      isPublic: true,
      isLogin: false,
      isAuthAdmin: false,
    },
    {
      pathname: `${PAGE.ADMIN}`,
      element: <Admin />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: true,
    },
    {
      pathname: `${PAGE.ADMIN_POST}`,
      element: <AdminPost />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: true,
    },
    {
      pathname: `${PAGE.ADMIN_COMMENT}`,
      element: <AdminComment />,
      isPublic: false,
      isLogin: true,
      isAuthAdmin: true,
    },
  ];

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {pages.map((page) => {
            const isAuthenticated = page.isPublic || token;
            const isAuthAdmin = page.isAuthAdmin;
            const isAdminAuthenticated =
              page.isAuthAdmin === true &&
              payload?.auth !== undefined &&
              payload?.auth === "ADMIN";

            return (
              <Route
                key={page.pathname}
                path={page.pathname}
                element={
                  <ProtectedRoute
                    token={token}
                    pathname={page.pathname}
                    isAuthenticated={isAuthenticated}
                    isAdminAuthenticated={isAdminAuthenticated}
                    isAuthAdmin={isAuthAdmin}
                  >
                    {page.element}
                  </ProtectedRoute>
                }
              />
            );
          })}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default Router;
