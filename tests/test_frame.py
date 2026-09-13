import json
import os
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest.mock import patch

import api.frame as frame


class FakeHttpResponse:
    status_code = 200

    def raise_for_status(self):
        return None

    def json(self):
        output_text = frame.ProjectFrame(
            project_title="작은 독서 모임",
            metric_goals=["6명이 첫 모임에 참여한다"],
            desired_responses=["다음 모임에도 오고 싶다고 말한다"],
            key_hurdle="참여자가 원하는 대화 방식을 모른다",
            boundaries=["90분 안에 마친다", "발언을 강요하지 않는다"],
            first_actions=["후보 참여자 두 명에게 질문한다", "모임 안내 초안을 쓴다"],
        ).model_dump_json()
        return {"steps": [{"type": "model_output", "content": [{"type": "text", "text": output_text}]}]}


class FrameEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), frame.handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.server.server_port}/api/frame"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def post(self, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.url,
            data=data,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=3) as response:
                return response.status, json.loads(response.read())
        except urllib.error.HTTPError as error:
            return error.code, json.loads(error.read())

    def test_requires_project_name_and_outcome(self):
        status, payload = self.post({"name": "", "outcome": ""})
        self.assertEqual(status, 400)
        self.assertIn("프로젝트 이름", payload["error"])

    def test_reports_missing_api_key_as_json(self):
        with patch.dict(os.environ, {}, clear=True):
            status, payload = self.post({"name": "독서 모임", "outcome": "대화를 나눈다"})
        self.assertEqual(status, 503)
        self.assertIn("API 키", payload["error"])

    def test_returns_structured_frame(self):
        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}, clear=False), patch.object(
            frame.requests, "post", return_value=FakeHttpResponse()
        ) as mock_post:
            status, payload = self.post({"name": "독서 모임", "outcome": "다음에도 만나고 싶은 대화를 만든다"})
        self.assertEqual(status, 200)
        self.assertEqual(payload["project_title"], "작은 독서 모임")
        self.assertEqual(len(payload["boundaries"]), 2)
        request_payload = mock_post.call_args.kwargs["json"]
        self.assertFalse(request_payload["store"])
        self.assertEqual(request_payload["response_format"]["mime_type"], "application/json")
        self.assertEqual(request_payload["generation_config"]["thinking_level"], "low")
        self.assertEqual(request_payload["generation_config"]["max_output_tokens"], 2048)


if __name__ == "__main__":
    unittest.main()
