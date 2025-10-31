import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// Cognito 설정
const REGION = 'us-east-1';
const USER_POOL_ID = 'us-east-1_ohLOswurY';
const CLIENT_ID = '4m4edj8snokmhqnajhlj41h9n2'; // nx-tt-dev-ver3-web-client

// 허용된 이메일
const ALLOWED_EMAIL = 'ai@sedaily.com';

// Cognito 클라이언트 생성
const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
});

/**
 * Cognito를 통한 로그인
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} 사용자 정보 및 토큰
 */
export const login = async (email, password) => {
  try {
    // Cognito 인증 시도
    const authCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const authResponse = await cognitoClient.send(authCommand);

    if (!authResponse.AuthenticationResult) {
      throw new Error('로그인에 실패했습니다.');
    }

    const { AccessToken, IdToken, RefreshToken } = authResponse.AuthenticationResult;

    // 사용자 정보 가져오기
    const getUserCommand = new GetUserCommand({
      AccessToken,
    });

    const userResponse = await cognitoClient.send(getUserCommand);

    // 사용자 정보 파싱
    const userAttributes = {};
    userResponse.UserAttributes.forEach(attr => {
      userAttributes[attr.Name] = attr.Value;
    });

    // 이메일 검증 (보안을 위해 세부 정보 노출 안 함)
    if (userAttributes.email !== ALLOWED_EMAIL) {
      throw new Error('로그인에 실패했습니다.');
    }

    return {
      email: userAttributes.email || email,
      name: userAttributes.name || userAttributes.email?.split('@')[0] || '관리자',
      tokens: {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
      },
      loginTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Login error:', error);

    // 통합된 에러 메시지 (보안을 위해 상세 정보 노출 안 함)
    throw new Error('로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.');
  }
};

/**
 * 액세스 토큰 검증
 * @param {string} accessToken
 * @returns {Promise<Object>} 사용자 정보
 */
export const validateToken = async (accessToken) => {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    const userAttributes = {};
    response.UserAttributes.forEach(attr => {
      userAttributes[attr.Name] = attr.Value;
    });

    // 이메일 재검증
    if (userAttributes.email !== ALLOWED_EMAIL) {
      throw new Error('접근 권한이 없습니다.');
    }

    return {
      email: userAttributes.email,
      name: userAttributes.name || userAttributes.email?.split('@')[0] || '관리자',
      username: response.Username,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    throw new Error('토큰이 유효하지 않습니다.');
  }
};

/**
 * 로그아웃
 */
export const logout = () => {
  // 로컬 스토리지에서 토큰 제거
  localStorage.removeItem('user');
  localStorage.removeItem('tokens');
};

export default {
  login,
  validateToken,
  logout,
};
